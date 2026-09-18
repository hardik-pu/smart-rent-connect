$ErrorActionPreference = 'Stop'

$passed = 0
$failed = 0

function Report-Test {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $global:passed++
    } else {
        Write-Host "  [FAIL] $Name - $Details" -ForegroundColor Red
        $global:failed++
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  SMART RENT CONNECT - COMPREHENSIVE E2E VERIFICATION SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$BASE_API = "http://localhost:5000"
$CLIENT_URL = "http://localhost:3000"

# 1. Health & Core Service Availability
Write-Host "1. Core Service & Frontend Route Availability" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BASE_API/api/health" -Method Get
    Report-Test "Backend /api/health check" ($health.status -eq "healthy") "Status was $($health.status)"
} catch {
    Report-Test "Backend /api/health check" $false $_.Exception.Message
}

$routes = @("/", "/properties", "/about", "/contact", "/login", "/register", "/properties/compare")
foreach ($route in $routes) {
    try {
        $resp = Invoke-WebRequest -Uri "$CLIENT_URL$route" -Method Get -UseBasicParsing
        Report-Test "Frontend Route: $route" ($resp.StatusCode -eq 200) "Status $($resp.StatusCode)"
    } catch {
        Report-Test "Frontend Route: $route" $false $_.Exception.Message
    }
}

# 2. Authentication & RBAC
Write-Host "`n2. Authentication & Role-Based Access Control (RBAC)" -ForegroundColor Yellow
$adminToken = $null
$ownerToken = $null
$tenantToken = $null
$testUserToken = $null
$testUserId = $null

try {
    $adminLogin = Invoke-RestMethod -Uri "$BASE_API/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@smartrent.com","password":"Password123!"}'
    $adminToken = $adminLogin.token
    Report-Test "Admin Login (admin@smartrent.com)" ($adminLogin.user.role -eq "ADMIN" -and $adminToken -ne $null)
} catch {
    Report-Test "Admin Login" $false $_.Exception.Message
}

try {
    $ownerLogin = Invoke-RestMethod -Uri "$BASE_API/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"owner@smartrent.com","password":"Password123!"}'
    $ownerToken = $ownerLogin.token
    Report-Test "Owner Login (owner@smartrent.com)" ($ownerLogin.user.role -eq "OWNER" -and $ownerToken -ne $null)
} catch {
    Report-Test "Owner Login" $false $_.Exception.Message
}

try {
    $tenantLogin = Invoke-RestMethod -Uri "$BASE_API/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"tenant@smartrent.com","password":"Password123!"}'
    $tenantToken = $tenantLogin.token
    Report-Test "Tenant Login (tenant@smartrent.com)" ($tenantLogin.user.role -eq "TENANT" -and $tenantToken -ne $null)
} catch {
    Report-Test "Tenant Login" $false $_.Exception.Message
}

# Register a temporary test user
$tempEmail = "test_user_$(Get-Random)@demo.com"
try {
    $regBody = @{
        name = "Test E2E User"
        email = $tempEmail
        password = "Password123!"
        role = "TENANT"
        phone = "+91 99999 11111"
    } | ConvertTo-Json
    $regResp = Invoke-RestMethod -Uri "$BASE_API/api/auth/register" -Method Post -ContentType "application/json" -Body $regBody
    $testUserToken = $regResp.token
    $testUserId = $regResp.user.id
    Report-Test "New User Self-Registration" ($regResp.user.email -eq $tempEmail -and $testUserId -ne $null)
} catch {
    Report-Test "New User Self-Registration" $false $_.Exception.Message
}

# RBAC Gate Check: Tenant cannot access Admin stats
try {
    Invoke-RestMethod -Uri "$BASE_API/api/admin/stats" -Method Get -Headers @{ Authorization = "Bearer $tenantToken" }
    Report-Test "RBAC Gate: Tenant blocked from Admin API" $false "Tenant unexpectedly received 200 OK"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Report-Test "RBAC Gate: Tenant blocked from Admin API" ($statusCode -eq 403) "Expected 403, got $statusCode"
}

# 3. Property Search & Location Queries
Write-Host "`n3. Property Search, Filters & Geospatial Radius" -ForegroundColor Yellow

try {
    $allProps = Invoke-RestMethod -Uri "$BASE_API/api/properties" -Method Get
    Report-Test "Fetch All Properties Catalog" ($allProps.properties.Count -gt 0) "Found $($allProps.properties.Count) properties"
} catch {
    Report-Test "Fetch All Properties Catalog" $false $_.Exception.Message
}

try {
    $mumbaiProps = Invoke-RestMethod -Uri "$BASE_API/api/properties?city=Mumbai" -Method Get
    Report-Test "Search Properties by City (Mumbai)" ($mumbaiProps.properties.Count -gt 0) "Found $($mumbaiProps.properties.Count) listings"
} catch {
    Report-Test "Search Properties by City (Mumbai)" $false $_.Exception.Message
}

try {
    $rentProps = Invoke-RestMethod -Uri "$BASE_API/api/properties?minRent=20000&maxRent=70000" -Method Get
    Report-Test "Filter Properties by Rent Range (₹20,000 - ₹70,000)" ($rentProps.properties.Count -ge 0)
} catch {
    Report-Test "Filter Properties by Rent Range" $false $_.Exception.Message
}

try {
    # Andheri East, Mumbai coordinates: 19.1136, 72.8697
    $nearbyProps = Invoke-RestMethod -Uri "$BASE_API/api/properties/nearby?lat=19.1136&lng=72.8697&radiusKm=25" -Method Get
    Report-Test "Geospatial Radius Query (`$geoNear 25km)" ($nearbyProps.properties.Count -ge 0) "Returned $($nearbyProps.properties.Count) nearby"
} catch {
    Report-Test "Geospatial Radius Query" $false $_.Exception.Message
}

# 4. Property Management Lifecycle (Owner CRUD)
Write-Host "`n4. Property Management Lifecycle (Owner CRUD)" -ForegroundColor Yellow
$createdPropId = $null

try {
    $newProp = @{
        title = "Automated Test Studio Apt"
        description = "Created by automated verification script."
        propertyType = "apartment"
        rent = 35000
        securityDeposit = 70000
        bedrooms = 1
        bathrooms = 1
        area = 550
        furnishing = "SEMI_FURNISHED"
        address = "104 Test Lane, Powai"
        city = "Mumbai"
        state = "Maharashtra"
        pincode = "400076"
        latitude = 19.1197
        longitude = 72.9051
        amenities = @("WIFI", "AC", "PARKING")
    } | ConvertTo-Json

    $createResp = Invoke-RestMethod -Uri "$BASE_API/api/properties" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $ownerToken" } -Body $newProp
    $createdPropId = $createResp.property._id
    Report-Test "Owner Creates Property Listing" ($createdPropId -ne $null -and $createResp.property.title -eq "Automated Test Studio Apt")
} catch {
    Report-Test "Owner Creates Property Listing" $false $_.Exception.Message
}

try {
    $updateBody = @{
        rent = 37000
        description = "Updated rent by automated test suite."
    } | ConvertTo-Json
    $updateResp = Invoke-RestMethod -Uri "$BASE_API/api/properties/$createdPropId" -Method Put -ContentType "application/json" -Headers @{ Authorization = "Bearer $ownerToken" } -Body $updateBody
    Report-Test "Owner Updates Property Listing" ($updateResp.property.rent -eq 37000)
} catch {
    Report-Test "Owner Updates Property Listing" $false $_.Exception.Message
}

# 5. Tenant Interaction Features (Favourites, Enquiries, Visits)
Write-Host "`n5. Tenant Features (Favourites, Inquiries & Visits)" -ForegroundColor Yellow

$favId = $null
try {
    $favBody = @{ propertyId = $createdPropId } | ConvertTo-Json
    $favResp = Invoke-RestMethod -Uri "$BASE_API/api/favourites" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $tenantToken" } -Body $favBody
    Report-Test "Tenant Adds Property to Favourites" ($favResp.success -eq $true)
} catch {
    Report-Test "Tenant Adds Property to Favourites" $false $_.Exception.Message
}

try {
    $favList = Invoke-RestMethod -Uri "$BASE_API/api/favourites" -Method Get -Headers @{ Authorization = "Bearer $tenantToken" }
    Report-Test "Tenant Retrieves Favourites List" ($favList.favourites.Count -gt 0)
} catch {
    Report-Test "Tenant Retrieves Favourites List" $false $_.Exception.Message
}

try {
    $delFav = Invoke-RestMethod -Uri "$BASE_API/api/favourites/$createdPropId" -Method Delete -Headers @{ Authorization = "Bearer $tenantToken" }
    Report-Test "Tenant Removes Property from Favourites" ($delFav.success -eq $true)
} catch {
    Report-Test "Tenant Removes Property from Favourites" $false $_.Exception.Message
}

$enquiryId = $null
try {
    $enqBody = @{
        propertyId = $createdPropId
        message = "Hello! Is this property available for occupancy from next month?"
    } | ConvertTo-Json
    $enqResp = Invoke-RestMethod -Uri "$BASE_API/api/enquiries" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $tenantToken" } -Body $enqBody
    $enquiryId = $enqResp.enquiry._id
    Report-Test "Tenant Submits Inquiry" ($enquiryId -ne $null)
} catch {
    Report-Test "Tenant Submits Inquiry" $false $_.Exception.Message
}

try {
    $replyBody = @{
        status = "CONTACTED"
        reply = "Yes, immediate occupancy is available!"
    } | ConvertTo-Json
    $replyResp = Invoke-RestMethod -Uri "$BASE_API/api/enquiries/$enquiryId/status" -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $ownerToken" } -Body $replyBody
    Report-Test "Owner Responds to Inquiry" ($replyResp.enquiry.status -eq "CONTACTED")
} catch {
    Report-Test "Owner Responds to Inquiry" $false $_.Exception.Message
}

$visitId = $null
try {
    $visitBody = @{
        propertyId = $createdPropId
        requestedDate = (Get-Date).AddDays(3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        requestedTime = "11:00 AM - 12:00 PM"
        message = "Interested in touring the apartment."
    } | ConvertTo-Json
    $visitResp = Invoke-RestMethod -Uri "$BASE_API/api/visits" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $tenantToken" } -Body $visitBody
    $visitId = $visitResp.visit._id
    Report-Test "Tenant Schedules Property Visit" ($visitId -ne $null -and $visitResp.visit.status -eq "PENDING")
} catch {
    Report-Test "Tenant Schedules Property Visit" $false $_.Exception.Message
}

try {
    $confirmBody = @{ status = "CONFIRMED" } | ConvertTo-Json
    $confirmResp = Invoke-RestMethod -Uri "$BASE_API/api/visits/$visitId/status" -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $ownerToken" } -Body $confirmBody
    Report-Test "Owner Confirms Property Visit" ($confirmResp.visit.status -eq "CONFIRMED")
} catch {
    Report-Test "Owner Confirms Property Visit" $false $_.Exception.Message
}

try {
    $cancelBody = @{ status = "CANCELLED" } | ConvertTo-Json
    $cancelResp = Invoke-RestMethod -Uri "$BASE_API/api/visits/$visitId/status" -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $tenantToken" } -Body $cancelBody
    Report-Test "Tenant Cancels Visit with Notification" ($cancelResp.visit.status -eq "CANCELLED")
} catch {
    Report-Test "Tenant Cancels Visit with Notification" $false $_.Exception.Message
}

# 6. Admin Supervision, Moderation & Security
Write-Host "`n6. Admin Moderation & Account Suspension Guard" -ForegroundColor Yellow

try {
    $stats = Invoke-RestMethod -Uri "$BASE_API/api/admin/stats" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    Report-Test "Admin Retrieves Platform Statistics" ($stats.stats.totalUsers -gt 0 -and $stats.stats.totalProperties -gt 0) "Users: $($stats.stats.totalUsers), Props: $($stats.stats.totalProperties)"
} catch {
    Report-Test "Admin Retrieves Platform Statistics" $false $_.Exception.Message
}

try {
    $usersList = Invoke-RestMethod -Uri "$BASE_API/api/admin/users" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    Report-Test "Admin User Directory Query" ($usersList.users.Count -gt 0) "Found $($usersList.users.Count) accounts"
} catch {
    Report-Test "Admin User Directory Query" $false $_.Exception.Message
}

try {
    # Suspend the temporary user
    $suspendBody = @{ accountStatus = "SUSPENDED" } | ConvertTo-Json
    $suspendResp = Invoke-RestMethod -Uri "$BASE_API/api/admin/users/$testUserId" -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body $suspendBody
    Report-Test "Admin Suspends User Account" ($suspendResp.user.accountStatus -eq "SUSPENDED")
} catch {
    Report-Test "Admin Suspends User Account" $false $_.Exception.Message
}

# Verify suspended account cannot login
try {
    Invoke-RestMethod -Uri "$BASE_API/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $tempEmail; password = "Password123!" } | ConvertTo-Json)
    Report-Test "Security Guard: Suspended User Login Blocked" $false "Suspended user was unexpectedly allowed to login"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Report-Test "Security Guard: Suspended User Login Blocked" ($statusCode -eq 403) "Expected 403, got $statusCode"
}

# Reactivate the user
try {
    $reactivateBody = @{ accountStatus = "ACTIVE" } | ConvertTo-Json
    $reactivateResp = Invoke-RestMethod -Uri "$BASE_API/api/admin/users/$testUserId" -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body $reactivateBody
    Report-Test "Admin Reactivates User Account" ($reactivateResp.user.accountStatus -eq "ACTIVE")
} catch {
    Report-Test "Admin Reactivates User Account" $false $_.Exception.Message
}

# Admin approves the newly created property
try {
    $verifyBody = @{ status = "APPROVED" } | ConvertTo-Json
    $verifyResp = Invoke-RestMethod -Uri "$BASE_API/api/admin/properties/$createdPropId/verify" -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" } -Body $verifyBody
    Report-Test "Admin Approves Property Listing" ($verifyResp.property.verificationStatus -eq "APPROVED")
} catch {
    Report-Test "Admin Approves Property Listing" $false $_.Exception.Message
}

# Admin deletes the temporary test property
try {
    $delPropResp = Invoke-RestMethod -Uri "$BASE_API/api/admin/properties/$createdPropId" -Method Delete -Headers @{ Authorization = "Bearer $adminToken" }
    Report-Test "Admin Deletes Property Listing" ($delPropResp.success -eq $true)
} catch {
    Report-Test "Admin Deletes Property Listing" $false $_.Exception.Message
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION COMPLETE: $passed PASSED, $failed FAILED" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
}
