<?php
require 'vendor/autoload.php';

$adminToken = '8|PksVRL8LkxKERsRoskTns5htCoQvXwDAVtC6mj4M45c78175';
$managerToken = '9|lxGwjZzMt1b0wRBGLz9gSHRieQ88DWKf6yAKI3sP151090d1';
$memberToken = '10|6JV0KnSGVVQMKyUenQG8814SI4WkI4yQkKaz3KD25a4331db';

function request($method, $url, $token, $data = null) {
    $ch = curl_init("http://localhost:8001$url");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ];
    
    if ($data) {
        $payload = json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        $headers[] = "Content-Type: application/json";
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return "HTTP $httpCode - " . $response;
}

echo "1. Manager Projects List:\n";
echo request('GET', '/api/v1/manager/projects', $managerToken) . "\n\n";

echo "2. Triggering a notification for Member by creating a Task...\n";
$taskData = [
    'project_id' => 3, // Assuming 3 is Website Redesign owned by Manager
    'title' => 'Test Notification Task',
    'priority' => 'low',
    'status' => 'to_do',
    'due_date' => date('Y-m-d', strtotime('+1 week')),
    'assigned_to' => 3 // Assuming 3 is Test Member
];
echo request('POST', '/api/v1/manager/tasks', $managerToken, $taskData) . "\n\n";

echo "3. Fetch Member Notifications:\n";
$notifResponse = request('GET', '/api/v1/notifications', $memberToken);
echo $notifResponse . "\n\n";

// Extract notification ID
preg_match('/"id":"([^"]+)"/', $notifResponse, $matches);
if (isset($matches[1])) {
    $notifId = $matches[1];
    echo "4. Mark Notification Read:\n";
    echo request('PATCH', "/api/v1/notifications/$notifId/read", $memberToken) . "\n\n";
    
    echo "5. Delete Notification:\n";
    echo request('DELETE', "/api/v1/notifications/$notifId", $memberToken) . "\n\n";
} else {
    echo "No notification found to test read/delete.\n\n";
}

echo "6. Update Admin Profile:\n";
$updateData = ['name' => 'Updated Admin Name', 'phone' => '123-456-7890'];
echo request('PUT', '/api/v1/profile', $adminToken, $updateData) . "\n\n";

echo "7. Fetch Admin Profile to verify update:\n";
echo request('GET', '/api/v1/profile', $adminToken) . "\n\n";

// Revert Admin Profile
$revertData = ['name' => 'Test Admin', 'phone' => null];
request('PUT', '/api/v1/profile', $adminToken, $revertData);
