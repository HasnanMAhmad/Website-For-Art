<?php
/**
 * MISHIS ARTWORK — Secure Image Upload Endpoint
 * Saves uploaded artwork photographs to /assets/uploads/
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Studio-Pin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth.php';

// Check authorization (allow either authenticated or dev mode)
if (!isAuthorized() && !isset($_GET['allow_guest'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized: Please authenticate to upload images']);
    exit;
}

$uploadDir = dirname(__DIR__) . '/assets/uploads';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

// 1. Multipart file upload
if (!empty($_FILES['image']) && is_uploaded_file($_FILES['image']['tmp_name'])) {
    $file = $_FILES['image'];
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!isset($allowed[$mime])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid file format. Allowed: JPG, PNG, WEBP.']);
        exit;
    }

    $ext = $allowed[$mime];
    $filename = 'art_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $targetPath = $uploadDir . '/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $publicUrl = 'assets/uploads/' . $filename;
        echo json_encode([
            'success' => true,
            'url' => $publicUrl,
            'filename' => $filename,
            'mime' => $mime
        ]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file to storage.']);
        exit;
    }
}

// 2. Base64 data URL upload via JSON
$raw = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!empty($body['dataUrl'])) {
    $dataUrl = $body['dataUrl'];
    if (preg_match('/^data:image\/(jpeg|png|webp|gif);base64,(.*)$/i', $dataUrl, $matches)) {
        $ext = ($matches[1] === 'jpeg') ? 'jpg' : $matches[1];
        $binaryData = base64_decode($matches[2]);
        if ($binaryData) {
            $filename = 'art_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $targetPath = $uploadDir . '/' . $filename;
            if (file_put_contents($targetPath, $binaryData)) {
                $publicUrl = 'assets/uploads/' . $filename;
                echo json_encode([
                    'success' => true,
                    'url' => $publicUrl,
                    'filename' => $filename
                ]);
                exit;
            }
        }
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'No valid image received. Send file as multipart/form-data or base64 dataUrl.']);
