<?php
/**
 * MISHIS ARTWORK — Orders & Checkout Persistence API
 * Stores orders in MySQL database (with automatic schema creation)
 * and falls back to JSON file storage (api/data/orders.json).
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Studio-Pin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

define('ORDERS_FILE', DATA_DIR . '/orders.json');

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure orders table exists in MySQL if connected
function ensureOrdersSchema($pdo) {
    if (!$pdo) return;
    try {
        $sql = "CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(64) PRIMARY KEY,
            orderNumber VARCHAR(64) NOT NULL,
            customerName VARCHAR(255) NOT NULL,
            customerEmail VARCHAR(255) NOT NULL,
            customerPhone VARCHAR(64) DEFAULT '',
            deliveryAddress TEXT,
            itemsJson LONGTEXT NOT NULL,
            currency VARCHAR(16) DEFAULT 'GBP',
            totalGBP DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            formattedTotal VARCHAR(64) DEFAULT '',
            checkoutMethod VARCHAR(32) DEFAULT 'card_gateway',
            paymentStatus VARCHAR(32) DEFAULT 'paid',
            transactionId VARCHAR(64) DEFAULT '',
            cardLast4 VARCHAR(8) DEFAULT '',
            cardBrand VARCHAR(32) DEFAULT '',
            status VARCHAR(32) DEFAULT 'pending',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $pdo->exec($sql);
        @$pdo->exec("ALTER TABLE orders ADD COLUMN paymentStatus VARCHAR(32) DEFAULT 'paid'");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN transactionId VARCHAR(64) DEFAULT ''");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN cardLast4 VARCHAR(8) DEFAULT ''");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN cardBrand VARCHAR(32) DEFAULT ''");
    } catch (Throwable $e) {
        // Fallback silently if table creation fails
    }
}

function readJsonOrders() {
    if (!file_exists(ORDERS_FILE)) {
        return [];
    }
    $raw = @file_get_contents(ORDERS_FILE);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function writeJsonOrders($orders) {
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0755, true);
    }
    return @file_put_contents(ORDERS_FILE, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// -------------------------------------------------------------
// 1. GET: Fetch Orders (for Studio Admin Portal)
// -------------------------------------------------------------
if ($method === 'GET') {
    $orders = [];
    $dbMode = 'json';

    if ($pdo) {
        try {
            ensureOrdersSchema($pdo);
            $stmt = $pdo->query("SELECT * FROM orders ORDER BY createdAt DESC, id DESC");
            $rows = $stmt->fetchAll();
            foreach ($rows as $r) {
                $orders[] = [
                    'id'             => $r['id'],
                    'orderNumber'    => $r['orderNumber'] ?? $r['id'],
                    'customer'       => [
                        'name'    => $r['customerName'],
                        'email'   => $r['customerEmail'],
                        'phone'   => $r['customerPhone'],
                        'address' => $r['deliveryAddress']
                    ],
                    'items'          => json_decode($r['itemsJson'] ?? '[]', true) ?: [],
                    'currency'       => $r['currency'],
                    'totalGBP'       => (float)$r['totalGBP'],
                    'formattedTotal' => $r['formattedTotal'],
                    'checkoutMethod' => $r['checkoutMethod'] ?? 'card_gateway',
                    'paymentStatus'  => $r['paymentStatus'] ?? 'paid',
                    'transactionId'  => $r['transactionId'] ?? '',
                    'cardLast4'      => $r['cardLast4'] ?? '',
                    'cardBrand'      => $r['cardBrand'] ?? '',
                    'status'         => $r['status'],
                    'createdAt'      => $r['createdAt']
                ];
            }
            $dbMode = 'mysql';
        } catch (Throwable $e) {
            $orders = readJsonOrders();
            $dbMode = 'json_fallback';
        }
    } else {
        $orders = readJsonOrders();
    }

    echo json_encode([
        'success' => true,
        'count'   => count($orders),
        'dbMode'  => $dbMode,
        'orders'  => $orders
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// 2. POST: Create & Record New Order
// -------------------------------------------------------------
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    // Customer info extraction
    $customer = $payload['customer'] ?? [];
    $customerName = trim($customer['name'] ?? ($payload['customerName'] ?? 'Guest Collector'));
    $customerEmail = trim($customer['email'] ?? ($payload['customerEmail'] ?? ''));
    $customerPhone = trim($customer['phone'] ?? ($payload['customerPhone'] ?? ''));
    $deliveryAddress = trim($customer['address'] ?? ($payload['deliveryAddress'] ?? ''));

    $items = is_array($payload['items'] ?? null) ? $payload['items'] : [];
    if (empty($items)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Cart items cannot be empty']);
        exit;
    }

    $orderNumber = $payload['orderNumber'] ?? ('MISHI-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5)));
    $id = $payload['id'] ?? ('order-' . uniqid());
    $currency = $payload['currency'] ?? 'GBP';
    $totalGBP = (float)($payload['totalGBP'] ?? 0.0);
    $formattedTotal = $payload['formattedTotal'] ?? '';
    $checkoutMethod = $payload['checkoutMethod'] ?? 'direct';
    $status = $payload['status'] ?? 'pending';
    $paymentStatus = $payload['paymentStatus'] ?? 'paid';
    $transactionId = $payload['transactionId'] ?? ('TXN-' . strtoupper(substr(uniqid(), -8)));
    $cardLast4 = $payload['cardLast4'] ?? '4242';
    $cardBrand = $payload['cardBrand'] ?? 'Card';
    $createdAt = $payload['createdAt'] ?? date('c');

    $orderRecord = [
        'id'             => $id,
        'orderNumber'    => $orderNumber,
        'customer'       => [
            'name'    => $customerName,
            'email'   => $customerEmail,
            'phone'   => $customerPhone,
            'address' => $deliveryAddress
        ],
        'items'          => $items,
        'currency'       => $currency,
        'totalGBP'       => $totalGBP,
        'formattedTotal' => $formattedTotal,
        'checkoutMethod' => $checkoutMethod,
        'paymentStatus'  => $paymentStatus,
        'transactionId'  => $transactionId,
        'cardLast4'      => $cardLast4,
        'cardBrand'      => $cardBrand,
        'status'         => $status,
        'createdAt'      => $createdAt
    ];

    // Always persist to JSON file storage
    $jsonOrders = readJsonOrders();
    array_unshift($jsonOrders, $orderRecord);
    writeJsonOrders($jsonOrders);

    // Persist to MySQL if available
    $savedToDb = false;
    if ($pdo) {
        try {
            ensureOrdersSchema($pdo);
            $stmt = $pdo->prepare("INSERT INTO orders 
                (id, orderNumber, customerName, customerEmail, customerPhone, deliveryAddress, itemsJson, currency, totalGBP, formattedTotal, checkoutMethod, paymentStatus, transactionId, cardLast4, cardBrand, status, createdAt)
                VALUES 
                (:id, :orderNumber, :customerName, :customerEmail, :customerPhone, :deliveryAddress, :itemsJson, :currency, :totalGBP, :formattedTotal, :checkoutMethod, :paymentStatus, :transactionId, :cardLast4, :cardBrand, :status, :createdAt)
                ON DUPLICATE KEY UPDATE 
                customerName = VALUES(customerName), 
                customerEmail = VALUES(customerEmail),
                customerPhone = VALUES(customerPhone),
                deliveryAddress = VALUES(deliveryAddress),
                status = VALUES(status),
                paymentStatus = VALUES(paymentStatus)");

            $stmt->execute([
                ':id'             => $id,
                ':orderNumber'    => $orderNumber,
                ':customerName'   => $customerName,
                ':customerEmail'  => $customerEmail,
                ':customerPhone'  => $customerPhone,
                ':deliveryAddress' => $deliveryAddress,
                ':itemsJson'      => json_encode($items, JSON_UNESCAPED_UNICODE),
                ':currency'       => $currency,
                ':totalGBP'       => $totalGBP,
                ':formattedTotal' => $formattedTotal,
                ':checkoutMethod' => $checkoutMethod,
                ':paymentStatus'  => $paymentStatus,
                ':transactionId'  => $transactionId,
                ':cardLast4'      => $cardLast4,
                ':cardBrand'      => $cardBrand,
                ':status'         => $status,
                ':createdAt'      => date('Y-m-d H:i:s', strtotime($createdAt))
            ]);
            $savedToDb = true;
        } catch (Throwable $e) {
            $savedToDb = false;
        }
    }

    echo json_encode([
        'success'     => true,
        'message'     => 'Order successfully recorded and confirmed',
        'orderId'     => $id,
        'orderNumber' => $orderNumber,
        'savedToDb'   => $savedToDb,
        'order'       => $orderRecord
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// 3. PATCH / PUT: Update Order Status
// -------------------------------------------------------------
if ($method === 'PATCH' || $method === 'PUT') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);
    $id = $_GET['id'] ?? ($payload['id'] ?? '');
    $newStatus = $payload['status'] ?? '';

    if (!$id || !$newStatus) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing order ID or status']);
        exit;
    }

    $jsonOrders = readJsonOrders();
    $found = false;
    foreach ($jsonOrders as &$ord) {
        if ($ord['id'] === $id || ($ord['orderNumber'] ?? '') === $id) {
            $ord['status'] = $newStatus;
            $ord['updatedAt'] = date('c');
            $found = true;
            break;
        }
    }
    if ($found) {
        writeJsonOrders($jsonOrders);
    }

    if ($pdo) {
        try {
            ensureOrdersSchema($pdo);
            $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id OR orderNumber = :id");
            $stmt->execute([':status' => $newStatus, ':id' => $id]);
        } catch (Throwable $e) {}
    }

    echo json_encode(['success' => true, 'id' => $id, 'status' => $newStatus]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
