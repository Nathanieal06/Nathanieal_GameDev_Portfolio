
# Script to inject Natalie chatbot into all portfolio pages
# Run from: d:\Portfolio\Nathanieal_GameDev_Portfolio

$pages = @(
    # Root pages
    "pages\academics.html",
    "pages\contact.html",
    "pages\games.html",
    "pages\projects.html",
    "pages\resume.html",
    "pages\studying.html",
    # Game pages (2 levels deep -> assets path is ../../)
    "pages\games\cityscape.html",
    "pages\games\echo-the-paradox.html",
    "pages\games\galaxy-strike.html",
    "pages\games\last-stride.html",
    "pages\games\legacy-of-dharma.html",
    "pages\games\obstacle-dodge.html",
    "pages\games\rocket-boost.html",
    "pages\games\royal-run.html",
    "pages\games\secret-book.html",
    "pages\games\sharp-shooter.html",
    "pages\games\sih-village-map.html",
    "pages\games\unity-programming-test.html",
    "pages\games\unity-rpg.html",
    "pages\games\zatun-zombie.html",
    # Project pages
    "pages\projects\healthcare-chatbot.html",
    "pages\projects\image-classification.html",
    "pages\projects\smart-irrigation.html",
    "pages\projects\video-game-sales.html"
)

# The chatbot HTML to inject before </body>
$chatbotHTML = @'

  <!-- ========== CHATBOT (NATALIE) ========== -->
  <div class="chat-widget">
    <button class="chat-toggle" id="chatToggle" aria-label="Open Chat">
      <i class="fas fa-comment-dots"></i>
    </button>
    <div class="chat-window" id="chatWindow">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">N</div>
          <div>
            <div class="chat-title">Natalie</div>
            <div class="chat-subtitle">Portfolio Assistant</div>
          </div>
        </div>
        <button class="chat-close" id="chatClose" aria-label="Close Chat">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-input-area">
        <input type="text" class="chat-input" id="chatInput" placeholder="Ask me anything..." autocomplete="off">
        <button class="chat-send" id="chatSend" aria-label="Send Message">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
'@

$skipped = 0
$updated = 0

foreach ($page in $pages) {
    $fullPath = Join-Path "d:\Portfolio\Nathanieal_GameDev_Portfolio" $page
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "SKIP (not found): $page" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    $content = Get-Content $fullPath -Raw -Encoding UTF8
    
    # Skip if chatbot already injected
    if ($content -match 'chat-widget') {
        Write-Host "SKIP (already has chatbot): $page" -ForegroundColor Cyan
        $skipped++
        continue
    }

    # Determine asset path depth
    $depth = ($page -split '\\').Count - 1  # 1 = pages/, 2 = pages/games/ or pages/projects/
    if ($depth -eq 1) {
        $cssPath = "../assets/css/chatbot.css"
        $jsPath  = "../assets/js/chatbot.js"
    } else {
        $cssPath = "../../assets/css/chatbot.css"
        $jsPath  = "../../assets/js/chatbot.js"
    }

    # Inject CSS link before </head>
    if ($content -notmatch 'chatbot\.css') {
        $content = $content -replace '</head>', "  <link rel=""stylesheet"" href=""$cssPath"">$([Environment]::NewLine)</head>"
    }

    # Inject chatbot HTML + JS before </body>
    $scriptTag = "  <script src=""$jsPath""></script>"
    $injection = $chatbotHTML + $scriptTag + "`r`n</body>"
    $content = $content -replace '</body>', $injection

    Set-Content $fullPath $content -Encoding UTF8 -NoNewline
    Write-Host "UPDATED: $page" -ForegroundColor Green
    $updated++
}

Write-Host ""
Write-Host "Done! Updated: $updated | Skipped: $skipped" -ForegroundColor White
