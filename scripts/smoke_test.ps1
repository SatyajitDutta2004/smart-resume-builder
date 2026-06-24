$api='http://localhost:4000/api'
$ts = Get-Date -Format 'yyyyMMddHHmmss'
$email = "ci_test_$ts@example.com"
Write-Output "Using email: $email"

# Signup
try{
  $signup = Invoke-RestMethod -Method Post -Uri "$api/auth/signup" -Body (@{name='CI Test'; email=$email; password='Password123!'} | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
  Write-Output "SIGNUP_TOKEN:$($signup.token)"
}catch{ Write-Output "SIGNUP_ERROR:$($_.Exception.Message)"; exit 1 }
$token = $signup.token

# Create resume with sections as object
$resumeBody = @{title='CI Resume'; industry='Engineering'; templateType='modern'; theme='light'; github='https://github.com/test'; linkedin='https://linkedin.com/in/test'; portfolio='https://portfolio.test'; sections = @{summary='Experienced backend engineer'; experience='Built APIs and systems'; skills='Node.js, MongoDB, Express'} }
try{
  $res = Invoke-RestMethod -Method Post -Uri "$api/resume" -Headers @{Authorization="Bearer $token"} -Body ($resumeBody | ConvertTo-Json -Depth 10) -ContentType 'application/json' -ErrorAction Stop
  Write-Output "RESUME_CREATED:$($res._id)"
}catch{ Write-Output "RESUME_ERROR:$($_.Exception.Message)"; exit 1 }

# Analyze job
$jd = "We need a backend engineer skilled in Node.js, MongoDB, Express, REST APIs"
try{
  $an = Invoke-RestMethod -Method Post -Uri "$api/resume/analyze-job" -Headers @{Authorization="Bearer $token"} -Body (@{sections=$resumeBody.sections; jobDescription=$jd} | ConvertTo-Json -Depth 10) -ContentType 'application/json' -ErrorAction Stop
  Write-Output "ANALYSIS_SCORE:$($an.score)"
  Write-Output "MISSING: $($an.missingSkills -join ', ')"
}catch{ Write-Output "ANALYSIS_ERROR:$($_.Exception.Message)"; exit 1 }

# ATS
try{
  $ats = Invoke-RestMethod -Method Post -Uri "$api/resume/ats" -Headers @{Authorization="Bearer $token"} -Body (@{sections=$resumeBody.sections; jobDescription=$jd} | ConvertTo-Json -Depth 10) -ContentType 'application/json' -ErrorAction Stop
  Write-Output "ATS_SCORE:$($ats.score)"
}catch{ Write-Output "ATS_ERROR:$($_.Exception.Message)"; exit 1 }

# Save analysis
try{
  $save = Invoke-RestMethod -Method Post -Uri "$api/resume/analysis" -Headers @{Authorization="Bearer $token"} -Body (@{resumeId=$res._id; jobDescription=$jd; sections=$resumeBody.sections; result=@{analysis=$an; ats=$ats}} | ConvertTo-Json -Depth 12) -ContentType 'application/json' -ErrorAction Stop
  Write-Output "ANALYSIS_SAVED:$($save.analysisId)"
}catch{ Write-Output "SAVE_ERROR:$($_.Exception.Message)"; exit 1 }
$aid=$save.analysisId

# Archive
try{
  Invoke-RestMethod -Method Delete -Uri "$api/resume/analysis/$aid" -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
  Write-Output "ARCHIVED:OK"
}catch{ Write-Output "ARCHIVE_ERROR:$($_.Exception.Message)"; exit 1 }

# Restore
try{
  Invoke-RestMethod -Method Patch -Uri "$api/resume/analysis/$aid/restore" -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
  Write-Output "RESTORED:OK"
}catch{ Write-Output "RESTORE_ERROR:$($_.Exception.Message)"; exit 1 }

# Stats
try{
  $stats = Invoke-RestMethod -Method Get -Uri "$api/resume/analysis/stats" -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
  Write-Output "STATS:"; $stats | ConvertTo-Json -Depth 6
}catch{ Write-Output "STATS_ERROR:$($_.Exception.Message)"; exit 1 }
