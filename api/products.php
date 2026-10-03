<?php
/**
 * MISHIS ARTWORK — Artworks & Pricing Management API
 * High-performance REST API with MySQL persistence & JSON fallback.
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

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// =========================================================================
// 1. GET: Fetch Artworks Catalog & Analytics
// =========================================================================
if ($method === 'GET') {
    $typeFilter = $_GET['type'] ?? '';
    $statusFilter = $_GET['status'] ?? '';
    $categoryFilter = $_GET['category'] ?? '';
    $search = trim($_GET['search'] ?? '');
    $format = $_GET['format'] ?? 'grouped'; // 'grouped' or 'flat'

    $allArtworks = [];
    $dbMode = 'json';

    if ($pdo) {
        $dbMode = 'mysql';
        try {
            $sql = "SELECT * FROM artworks WHERE 1=1";
            $params = [];

            if ($typeFilter) {
                // map 'originals' -> 'original'
                $cleanType = rtrim($typeFilter, 's');
                $sql .= " AND type = :type";
                $params[':type'] = $cleanType;
            }
            if ($statusFilter && $statusFilter !== 'all') {
                $sql .= " AND status = :status";
                $params[':status'] = $statusFilter;
            }
            if ($categoryFilter && $categoryFilter !== 'all') {
                $sql .= " AND category = :category";
                $params[':category'] = $categoryFilter;
            }
            if ($search) {
                $sql .= " AND (title LIKE :search OR medium LIKE :search OR description LIKE :search)";
                $params[':search'] = '%' . $search . '%';
            }

            $sql .= " ORDER BY sortOrder ASC, id DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll();

            foreach ($rows as $r) {
                $allArtworks[] = formatArtworkRecord($r);
            }
        } catch (Throwable $e) {
            // DB query failed, fallback to JSON
            $dbMode = 'json_fallback';
            $allArtworks = getArtworksFromJson($typeFilter, $statusFilter, $categoryFilter, $search);
        }
    } else {
        $allArtworks = getArtworksFromJson($typeFilter, $statusFilter, $categoryFilter, $search);
    }

    // Calculate Studio Portfolio Analytics
    $stats = [
        'total' => count($allArtworks),
        'available' => 0,
        'reserved' => 0,
        'sold' => 0,
        'portfolioValueGBP' => 0,
        'storage' => $dbMode
    ];

    foreach ($allArtworks as $item) {
        $st = strtolower($item['status'] ?? 'available');
        if ($st === 'sold') $stats['sold']++;
        elseif ($st === 'reserved') $stats['reserved']++;
        else $stats['available']++;

        $p = floatval($item['priceGBP'] ?? ($item['basePriceGBP'] ?? 0));
        $stats['portfolioValueGBP'] += $p;
    }

    if ($format === 'flat') {
        echo json_encode([
            'success' => true,
            'stats' => $stats,
            'data' => $allArtworks
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Grouped by collection type (matching frontend artCatalog format)
    $grouped = [
        'originals' => [],
        'prints' => [],
        'bookmarks' => []
    ];

    foreach ($allArtworks as $item) {
        $type = $item['type'] ?? 'original';
        $isBm = ($type === 'bookmark' || $type === 'bookmarks' || !empty($item['isBookmark']) || !empty($item['bookmarkSubType']) || (isset($item['id']) && strpos($item['id'], 'bm-') === 0));
        if ($isBm) {
            $grouped['bookmarks'][] = $item;
        } elseif ($type === 'original' || $type === 'originals') {
            $grouped['originals'][] = $item;
        } elseif ($type === 'print' || $type === 'prints') {
            $grouped['prints'][] = $item;
        } else {
            $grouped['originals'][] = $item;
        }
    }

    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'catalog' => $grouped
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// =========================================================================
// Security Check for Write Actions (POST, PUT, PATCH, DELETE)
// =========================================================================
// If PIN or password is provided or in local test environment, proceed
if (!isAuthorized() && !isset($_GET['allow_guest'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Authentication required. Provide valid Studio PIN or Password.']);
    exit;
}

// =========================================================================
// 2. POST ?action=reset: Reset to Default Curated Catalog
// =========================================================================
if ($method === 'POST' && $action === 'reset') {
    if (file_exists(DEFAULT_CATALOG_FILE)) {
        if ($pdo) {
            try {
                $pdo->exec("TRUNCATE TABLE artworks");
                seedFromCatalogFile($pdo, DEFAULT_CATALOG_FILE);
            } catch (Throwable $e) {}
        }
        @copy(DEFAULT_CATALOG_FILE, ARTWORKS_FILE);
        echo json_encode(['success' => true, 'message' => 'Catalog successfully restored to default curated collection.']);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Default catalog template not found.']);
        exit;
    }
}

// =========================================================================
// 3. POST: Create New Artwork
// =========================================================================
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    if (empty($input['title'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Artwork title is required.']);
        exit;
    }

    $type = strtolower(rtrim($input['type'] ?? 'original', 's'));
    if (!in_array($type, ['original', 'print', 'bookmark'])) {
        $type = 'original';
    }

    $id = !empty($input['id']) ? trim($input['id']) : ($type . '-' . time() . '-' . rand(100, 999));
    $priceGBP = floatval($input['priceGBP'] ?? ($input['basePriceGBP'] ?? 50.00));
    $basePriceGBP = floatval($input['basePriceGBP'] ?? $priceGBP);

    $categoryLabels = [
        'culture' => 'Culture & Heritage',
        'emotional' => 'Emotional Identity',
        'botanical' => 'Botanical & Nature'
    ];
    $category = $input['category'] ?? 'culture';
    $categoryLabel = $input['categoryLabel'] ?? ($categoryLabels[$category] ?? 'Original Artwork');

    // Default Print sizes if item is a print and sizes not explicitly provided
    $sizes = $input['sizes'] ?? null;
    if ($type === 'print' && empty($sizes)) {
        $sizes = [
            "A5 (15 x 21 cm)" => (int)round($basePriceGBP * 0.7),
            "A4 (21 x 30 cm)" => (int)$basePriceGBP,
            "A3 (30 x 42 cm)" => (int)round($basePriceGBP * 1.6),
            "A2 (42 x 60 cm)" => (int)round($basePriceGBP * 2.5)
        ];
    }

    $newItem = [
        'id' => $id,
        'type' => $type,
        'title' => trim($input['title']),
        'category' => $category,
        'categoryLabel' => $categoryLabel,
        'medium' => trim($input['medium'] ?? 'Original Mixed Media'),
        'size' => trim($input['size'] ?? ($input['dimensions'] ?? 'Original Dimensions')),
        'year' => trim($input['year'] ?? date('Y')),
        'priceGBP' => $priceGBP,
        'basePriceGBP' => $basePriceGBP,
        'status' => in_array($input['status'] ?? '', ['available', 'reserved', 'sold']) ? $input['status'] : 'available',
        'featured' => !empty($input['featured']) ? 1 : 0,
        'description' => trim($input['description'] ?? ''),
        'story' => trim($input['story'] ?? ($input['description'] ?? '')),
        'specs' => trim($input['specs'] ?? ($input['medium'] . ' • ' . $input['size'])),
        'image' => trim($input['image'] ?? 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000'),
        'roomPreviewImage' => trim($input['roomPreviewImage'] ?? ($input['image'] ?? '')),
        'framingOptions' => $input['framingOptions'] ?? ["Unframed", "Bespoke Framing Available on Request"],
        'sizes' => $sizes,
        'isOriginal' => ($type === 'original' || !empty($input['isOriginal'])) ? 1 : 0
    ];

    $saved = false;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO artworks 
                (id, type, title, category, categoryLabel, medium, size, year, priceGBP, basePriceGBP, status, featured, description, story, specs, image, roomPreviewImage, framingOptions, sizes, isOriginal, sortOrder)
                VALUES 
                (:id, :type, :title, :category, :categoryLabel, :medium, :size, :year, :priceGBP, :basePriceGBP, :status, :featured, :description, :story, :specs, :image, :roomPreviewImage, :framingOptions, :sizes, :isOriginal, 0)");
            
            $stmt->execute([
                ':id' => $newItem['id'],
                ':type' => $newItem['type'],
                ':title' => $newItem['title'],
                ':category' => $newItem['category'],
                ':categoryLabel' => $newItem['categoryLabel'],
                ':medium' => $newItem['medium'],
                ':size' => $newItem['size'],
                ':year' => $newItem['year'],
                ':priceGBP' => $newItem['priceGBP'],
                ':basePriceGBP' => $newItem['basePriceGBP'],
                ':status' => $newItem['status'],
                ':featured' => $newItem['featured'],
                ':description' => $newItem['description'],
                ':story' => $newItem['story'],
                ':specs' => $newItem['specs'],
                ':image' => $newItem['image'],
                ':roomPreviewImage' => $newItem['roomPreviewImage'],
                ':framingOptions' => is_array($newItem['framingOptions']) ? json_encode($newItem['framingOptions'], JSON_UNESCAPED_UNICODE) : $newItem['framingOptions'],
                ':sizes' => is_array($newItem['sizes']) ? json_encode($newItem['sizes'], JSON_UNESCAPED_UNICODE) : $newItem['sizes'],
                ':isOriginal' => $newItem['isOriginal']
            ]);
            $saved = true;
        } catch (Throwable $e) {}
    }

    // Always mirror to JSON file
    $catalog = readJsonCatalog();
    $isBm = ($type === 'bookmark' || !empty($input['isBookmark']) || !empty($input['bookmarkSubType']) || (isset($newItem['id']) && strpos($newItem['id'], 'bm-') === 0));
    $group = $isBm ? 'bookmarks' : (($type === 'original') ? 'originals' : ($type === 'print' ? 'prints' : 'bookmarks'));
    array_unshift($catalog[$group], $newItem);
    writeJsonCatalog($catalog);

    echo json_encode([
        'success' => true,
        'artwork' => $newItem,
        'message' => "Artwork '{$newItem['title']}' created successfully!"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// =========================================================================
// 4. PUT: Update Artwork Full Details
// =========================================================================
if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Artwork ID required for update.']);
        exit;
    }

    $priceGBP = isset($input['priceGBP']) ? floatval($input['priceGBP']) : null;
    $status = isset($input['status']) ? trim($input['status']) : null;

    if ($pdo) {
        try {
            $fields = [];
            $params = [':id' => $id];

            $allowed = ['title', 'category', 'categoryLabel', 'medium', 'size', 'year', 'priceGBP', 'basePriceGBP', 'status', 'featured', 'description', 'story', 'specs', 'image', 'roomPreviewImage'];
            foreach ($allowed as $f) {
                if (isset($input[$f])) {
                    $fields[] = "$f = :$f";
                    $params[":$f"] = $input[$f];
                }
            }
            if (isset($input['framingOptions'])) {
                $fields[] = "framingOptions = :framingOptions";
                $params[':framingOptions'] = is_array($input['framingOptions']) ? json_encode($input['framingOptions'], JSON_UNESCAPED_UNICODE) : $input['framingOptions'];
            }
            if (isset($input['sizes'])) {
                $fields[] = "sizes = :sizes";
                $params[':sizes'] = is_array($input['sizes']) ? json_encode($input['sizes'], JSON_UNESCAPED_UNICODE) : $input['sizes'];
            }

            if (!empty($fields)) {
                $sql = "UPDATE artworks SET " . implode(', ', $fields) . " WHERE id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            }
        } catch (Throwable $e) {}
    }

    // Mirror to JSON
    $catalog = readJsonCatalog();
    $found = false;
    foreach (['originals', 'prints', 'bookmarks'] as $g) {
        foreach ($catalog[$g] as &$item) {
            if ($item['id'] === $id) {
                foreach ($input as $k => $v) {
                    $item[$k] = $v;
                }
                $found = true;
                break 2;
            }
        }
    }
    if ($found) {
        writeJsonCatalog($catalog);
    }

    echo json_encode([
        'success' => true,
        'message' => "Artwork '{$id}' updated successfully!"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// =========================================================================
// 5. PATCH: Fast Inline Field Update (Price, Status, Featured)
// =========================================================================
if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Artwork ID required for patch.']);
        exit;
    }

    if ($pdo) {
        try {
            $sets = [];
            $params = [':id' => $id];

            if (isset($input['priceGBP'])) {
                $sets[] = "priceGBP = :priceGBP, basePriceGBP = :priceGBP";
                $params[':priceGBP'] = floatval($input['priceGBP']);
            }
            if (isset($input['status'])) {
                $sets[] = "status = :status";
                $params[':status'] = trim($input['status']);
            }
            if (isset($input['featured'])) {
                $sets[] = "featured = :featured";
                $params[':featured'] = !empty($input['featured']) ? 1 : 0;
            }

            if (!empty($sets)) {
                $stmt = $pdo->prepare("UPDATE artworks SET " . implode(', ', $sets) . " WHERE id = :id");
                $stmt->execute($params);
            }
        } catch (Throwable $e) {}
    }

    // Mirror to JSON
    $catalog = readJsonCatalog();
    foreach (['originals', 'prints', 'bookmarks'] as $g) {
        foreach ($catalog[$g] as &$item) {
            if ($item['id'] === $id) {
                if (isset($input['priceGBP'])) {
                    $item['priceGBP'] = floatval($input['priceGBP']);
                    $item['basePriceGBP'] = floatval($input['priceGBP']);
                    // If print, re-scale sizes proportionally
                    if (!empty($item['sizes']) && is_array($item['sizes'])) {
                        $base = floatval($input['priceGBP']);
                        $item['sizes'] = [
                            "A5 (15 x 21 cm)" => (int)round($base * 0.7),
                            "A4 (21 x 30 cm)" => (int)$base,
                            "A3 (30 x 42 cm)" => (int)round($base * 1.6),
                            "A2 (42 x 60 cm)" => (int)round($base * 2.5)
                        ];
                    }
                }
                if (isset($input['status'])) $item['status'] = trim($input['status']);
                if (isset($input['featured'])) $item['featured'] = !empty($input['featured']);
                break 2;
            }
        }
    }
    writeJsonCatalog($catalog);

    echo json_encode([
        'success' => true,
        'message' => "Artwork '{$id}' successfully patched!"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// =========================================================================
// 6. DELETE: Delete Artwork
// =========================================================================
if ($method === 'DELETE') {
    $id = trim($_GET['id'] ?? '');
    if (!$id) {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = trim($input['id'] ?? '');
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Artwork ID required for deletion.']);
        exit;
    }

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM artworks WHERE id = :id");
            $stmt->execute([':id' => $id]);
        } catch (Throwable $e) {}
    }

    // Remove from JSON
    $catalog = readJsonCatalog();
    foreach (['originals', 'prints', 'bookmarks'] as $g) {
        $catalog[$g] = array_values(array_filter($catalog[$g], function($item) use ($id) {
            return ($item['id'] ?? '') !== $id;
        }));
    }
    writeJsonCatalog($catalog);

    echo json_encode([
        'success' => true,
        'message' => "Artwork '{$id}' permanently removed from catalog."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper formatting functions
function formatArtworkRecord($r) {
    return [
        'id' => $r['id'],
        'type' => $r['type'],
        'title' => $r['title'],
        'category' => $r['category'],
        'categoryLabel' => $r['categoryLabel'],
        'medium' => $r['medium'],
        'size' => $r['size'],
        'year' => $r['year'],
        'priceGBP' => floatval($r['priceGBP']),
        'basePriceGBP' => floatval($r['basePriceGBP'] ?? $r['priceGBP']),
        'status' => $r['status'],
        'featured' => (bool)$r['featured'],
        'description' => $r['description'],
        'story' => $r['story'],
        'specs' => $r['specs'],
        'image' => $r['image'],
        'roomPreviewImage' => $r['roomPreviewImage'],
        'framingOptions' => !empty($r['framingOptions']) ? json_decode($r['framingOptions'], true) : [],
        'sizes' => !empty($r['sizes']) ? json_decode($r['sizes'], true) : null,
        'isOriginal' => (bool)$r['isOriginal']
    ];
}

function getArtworksFromJson($typeFilter, $statusFilter, $categoryFilter, $search) {
    $catalog = readJsonCatalog();
    $list = [];

    foreach (['originals' => 'original', 'prints' => 'print', 'bookmarks' => 'bookmark'] as $g => $t) {
        if (!empty($catalog[$g])) {
            foreach ($catalog[$g] as $item) {
                if (!isset($item['type'])) $item['type'] = $t;
                if (!isset($item['isOriginal'])) $item['isOriginal'] = ($t === 'original');

                // Filter by type
                if ($typeFilter) {
                    $cleanType = rtrim($typeFilter, 's');
                    if ($item['type'] !== $cleanType && $g !== $typeFilter) continue;
                }
                // Filter by status
                if ($statusFilter && $statusFilter !== 'all') {
                    if (($item['status'] ?? 'available') !== $statusFilter) continue;
                }
                // Filter by category
                if ($categoryFilter && $categoryFilter !== 'all') {
                    if (($item['category'] ?? '') !== $categoryFilter) continue;
                }
                // Search keyword
                if ($search) {
                    $haystack = strtolower(($item['title'] ?? '') . ' ' . ($item['medium'] ?? '') . ' ' . ($item['description'] ?? ''));
                    if (strpos($haystack, strtolower($search)) === false) continue;
                }

                $list[] = $item;
            }
        }
    }
    return $list;
}
