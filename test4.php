<?php
require 'test_gapfill.php';
echo "Result of /api/v1/admin/projects?search=&status=:\n";
echo request('GET', '/api/v1/admin/projects?search=&status=', $adminToken) . "\n\n";
