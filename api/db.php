<?php
/**
 * MISHIS ARTWORK — Database & Persistence Engine
 * Connects to Hostinger Production MySQL with automatic fallback to JSON file storage.
 * Auto-creates schema and auto-seeds initial artworks catalog.
 */

// Hostinger Live MySQL Credentials
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'u325926470_Mishi_Artwork');
define('DB_USER', 'u325926470_Mishi_DB_User');
define('DB_PASS', 'Mishiart_0401');

define('DATA_DIR', __DIR__ . '/data');
define('ARTWORKS_FILE', DATA_DIR . '/artworks.json');
define('DEFAULT_CATALOG_FILE', DATA_DIR . '/default_catalog.json');

function getDbConnection() {
    static $pdo = null;
    static $checked = false;

    if ($checked) {
        return $pdo;
    }
    $checked = true;

    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 3,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

        // Ensure artworks table exists
        ensureSchema($pdo);

        return $pdo;
    } catch (Throwable $e) {
        // Fallback gracefully to JSON file storage if DB is unreachable (e.g. local environment)
        $pdo = null;
        return null;
    }
}

function ensureSchema($pdo) {
    if (!$pdo) return;

    $sql = "CREATE TABLE IF NOT EXISTS artworks (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(64) DEFAULT 'culture',
        categoryLabel VARCHAR(128) DEFAULT 'Culture & Heritage',
        medium VARCHAR(255) DEFAULT '',
        size VARCHAR(128) DEFAULT '',
        year VARCHAR(16) DEFAULT '2026',
        priceGBP DECIMAL(10,2) NOT NULL DEFAULT 50.00,
        basePriceGBP DECIMAL(10,2) DEFAULT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'available',
        featured TINYINT(1) NOT NULL DEFAULT 0,
        description TEXT,
        story TEXT,
        specs TEXT,
        image LONGTEXT,
        roomPreviewImage LONGTEXT,
        framingOptions TEXT,
        sizes TEXT,
        isOriginal TINYINT(1) DEFAULT 0,
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);

    // Auto-seed if table is empty
    $count = (int)$pdo->query("SELECT COUNT(*) FROM artworks")->fetchColumn();
    if ($count === 0 && file_exists(DEFAULT_CATALOG_FILE)) {
        seedFromCatalogFile($pdo, DEFAULT_CATALOG_FILE);
    }
}

function seedFromCatalogFile($pdo, $filePath) {
    $raw = @file_get_contents($filePath);
    if (!$raw) return;
    $data = json_decode($raw, true);
    if (!is_array($data)) return;

    $stmt = $pdo->prepare("INSERT INTO artworks 
        (id, type, title, category, categoryLabel, medium, size, year, priceGBP, basePriceGBP, status, featured, description, story, specs, image, roomPreviewImage, framingOptions, sizes, isOriginal, sortOrder)
        VALUES 
        (:id, :type, :title, :category, :categoryLabel, :medium, :size, :year, :priceGBP, :basePriceGBP, :status, :featured, :description, :story, :specs, :image, :roomPreviewImage, :framingOptions, :sizes, :isOriginal, :sortOrder)
        ON DUPLICATE KEY UPDATE title = VALUES(title)");

    $order = 0;
    foreach (['originals' => 'original', 'prints' => 'print', 'bookmarks' => 'bookmark'] as $groupKey => $type) {
        if (!empty($data[$groupKey]) && is_array($data[$groupKey])) {
            foreach ($data[$groupKey] as $item) {
                $order++;
                $stmt->execute([
                    ':id'               => $item['id'] ?? ($type . '-' . uniqid()),
                    ':type'             => $type,
                    ':title'            => $item['title'] ?? 'Untitled Artwork',
                    ':category'         => $item['category'] ?? 'culture',
                    ':categoryLabel'    => $item['categoryLabel'] ?? 'Fine Art',
                    ':medium'           => $item['medium'] ?? '',
                    ':size'             => $item['size'] ?? '',
                    ':year'             => $item['year'] ?? '2026',
                    ':priceGBP'         => $item['priceGBP'] ?? ($item['basePriceGBP'] ?? 50.00),
                    ':basePriceGBP'     => $item['basePriceGBP'] ?? ($item['priceGBP'] ?? 50.00),
                    ':status'           => $item['status'] ?? 'available',
                    ':featured'         => !empty($item['featured']) ? 1 : 0,
                    ':description'      => $item['description'] ?? '',
                    ':story'            => $item['story'] ?? ($item['description'] ?? ''),
                    ':specs'            => $item['specs'] ?? '',
                    ':image'            => $item['image'] ?? '',
                    ':roomPreviewImage' => $item['roomPreviewImage'] ?? ($item['image'] ?? ''),
                    ':framingOptions'   => isset($item['framingOptions']) ? json_encode($item['framingOptions'], JSON_UNESCAPED_UNICODE) : null,
                    ':sizes'            => isset($item['sizes']) ? json_encode($item['sizes'], JSON_UNESCAPED_UNICODE) : null,
                    ':isOriginal'       => ($type === 'original' || !empty($item['isOriginal'])) ? 1 : 0,
                    ':sortOrder'        => $order
                ]);
            }
        }
    }
}

// Fallback JSON File Helpers
function readJsonCatalog() {
    if (!file_exists(ARTWORKS_FILE)) {
        if (file_exists(DEFAULT_CATALOG_FILE)) {
            @copy(DEFAULT_CATALOG_FILE, ARTWORKS_FILE);
        } else {
            return ['originals' => [], 'prints' => [], 'bookmarks' => []];
        }
    }
    $raw = @file_get_contents(ARTWORKS_FILE);
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return ['originals' => [], 'prints' => [], 'bookmarks' => []];
    }
    return $data;
}

function writeJsonCatalog($catalog) {
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0755, true);
    }
    return @file_put_contents(ARTWORKS_FILE, json_encode($catalog, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
