(function () {
  const posts = window.BLOG_POSTS || [];

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function renderListing() {
    const grid = document.getElementById("blogGrid");
    if (!grid) return;

    const searchInput = document.getElementById("blogSearch");
    const resultCount = document.getElementById("blogResultCount");
    const emptyState = document.getElementById("blogEmpty");
    const filterButtons = Array.from(document.querySelectorAll(".blog-filter-btn"));

    let activeCategory = "All";
    let activeQuery = "";

    function getFilteredPosts() {
      return posts.filter((post) => {
        const matchesCategory = activeCategory === "All" || post.category === activeCategory;
        const haystack = [post.title, post.description, post.category].join(" ").toLowerCase();
        const matchesQuery = !activeQuery || haystack.includes(activeQuery);
        return matchesCategory && matchesQuery;
      });
    }

    function renderCards() {
      const filteredPosts = getFilteredPosts();
      grid.innerHTML = filteredPosts
        .map(
          (post) => `
            <article class="blog-card">
              <a class="blog-card-media" href="/blog/${post.slug}/">
                <img src="${post.coverImage}" alt="${post.title}" loading="lazy">
              </a>
              <div class="blog-card-body">
                <div class="blog-card-meta">
                  <span class="blog-chip">${post.category}</span>
                  <span>${formatDate(post.date)}</span>
                  <span>${post.readingTime}</span>
                </div>
                <h2>${post.title}</h2>
                <p>${post.description}</p>
                <a class="blog-link-btn" href="/blog/${post.slug}/">Read more <span aria-hidden="true">→</span></a>
              </div>
            </article>
          `
        )
        .join("");

      if (resultCount) resultCount.textContent = filteredPosts.length;
      if (emptyState) emptyState.style.display = filteredPosts.length ? "none" : "block";
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
        activeCategory = this.dataset.category || "All";
        renderCards();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        activeQuery = this.value.trim().toLowerCase();
        renderCards();
      });
    }

    renderCards();
  }

  function renderPostHelpers() {
    const article = document.querySelector("[data-blog-post]");
    if (!article) return;

    const slug = article.getAttribute("data-slug");
    const post = posts.find((item) => item.slug === slug);
    if (!post) return;

    const readingTimeEl = document.getElementById("blogReadingTime");
    const dateEl = document.getElementById("blogPublishDate");
    const authorEl = document.getElementById("blogAuthor");
    const tagWrap = document.getElementById("blogTags");
    const tocWrap = document.getElementById("blogToc");
    const relatedWrap = document.getElementById("blogRelated");
    const shareWrap = document.getElementById("blogShare");
    const videoWrap = document.getElementById("blogVideoSection");
    const estimatedMinutes = Math.max(
      1,
      Math.round((article.textContent || "").trim().split(/\s+/).filter(Boolean).length / 220)
    );

    if (readingTimeEl) readingTimeEl.textContent = `${estimatedMinutes} min read`;
    if (dateEl) dateEl.textContent = formatDate(post.date);
    if (authorEl) authorEl.textContent = post.author;

    if (tagWrap) {
      tagWrap.innerHTML = (post.tags || [])
        .map((tag) => `<span class="blog-tag">#${tag}</span>`)
        .join("");
    }

    const headings = Array.from(article.querySelectorAll("h2, h3"));
    if (tocWrap) {
      tocWrap.innerHTML = headings
        .map((heading) => {
          if (!heading.id) heading.id = slugify(heading.textContent || "");
          const level = heading.tagName.toLowerCase() === "h3" ? "level-3" : "level-2";
          return `<a class="blog-toc-link ${level}" href="#${heading.id}">${heading.textContent}</a>`;
        })
        .join("");
    }

    if (shareWrap) {
      const pageUrl = window.location.href;
      const title = encodeURIComponent(post.title);
      const encodedUrl = encodeURIComponent(pageUrl);
      shareWrap.innerHTML = `
        <strong>Share</strong>
        <a class="blog-share-btn" href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}" target="_blank" rel="noreferrer">X</a>
        <a class="blog-share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noreferrer">LinkedIn</a>
        <a class="blog-share-btn" href="https://wa.me/?text=${title}%20${encodedUrl}" target="_blank" rel="noreferrer">WhatsApp</a>
        <a class="blog-share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noreferrer">Facebook</a>
      `;
    }

    if (videoWrap) {
      if (post.videoUrl) {
        videoWrap.innerHTML = `
          <h2>Related Video</h2>
          <div class="blog-video-frame">
            <iframe
              src="${post.videoUrl}"
              title="${post.videoTitle || post.title}"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen>
            </iframe>
          </div>
          <p class="blog-video-copy">${post.videoTitle || "Watch a related project or planning video for this topic."}</p>
        `;
      } else {
        videoWrap.style.display = "none";
      }
    }

    if (relatedWrap) {
      const relatedPosts = posts
        .filter((item) => item.slug !== post.slug)
        .filter((item) => item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))
        .slice(0, 2);

      relatedWrap.innerHTML = relatedPosts
        .map(
          (item) => `
            <article class="blog-related-card">
              <a href="/blog/${item.slug}/"><img src="${item.coverImage}" alt="${item.title}" loading="lazy"></a>
              <div class="blog-related-card-body">
                <div class="blog-card-meta">
                  <span class="blog-chip">${item.category}</span>
                  <span>${formatDate(item.date)}</span>
                </div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <a class="blog-link-btn" href="/blog/${item.slug}/">Read more <span aria-hidden="true">→</span></a>
              </div>
            </article>
          `
        )
        .join("");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderListing();
    renderPostHelpers();
  });
})();
