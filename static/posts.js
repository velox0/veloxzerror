const posts = document.querySelectorAll('.post');
const postContainer = document.getElementById('post-container');

document.getElementById('post-container').addEventListener('mousemove', (e) => {
  if (window.innerWidth < 768) return;
  if (!done) return;
  const postContainerWidth = postContainer.offsetWidth;
  const mouseX = e.clientX - postContainer.offsetLeft;
  const postIndex = Math.min(
    Math.max(0, Math.floor((mouseX / postContainerWidth) * posts.length)),
    posts.length - 1,
  );
  posts.forEach((post, index) => {
    if (index === postIndex) {
      post.classList.add('open-post');
      // set pseudo element background color
      document.body.style.setProperty('--bg-color', post.dataset.color);
    } else {
      post.classList.remove('open-post');
    }
  });
});

document.getElementById('post-container').addEventListener('mouseleave', () => {
  document.body.style.setProperty('--bg-color', 'var(--color-bg)');
});

document.getElementById('post-container').addEventListener('click', (e) => {
  if (window.innerWidth < 768) return;
  if (!done) return;
  const postContainerWidth = postContainer.offsetWidth;
  const mouseX = e.clientX - postContainer.offsetLeft;
  const postIndex = Math.min(
    Math.max(0, Math.floor((mouseX / postContainerWidth) * posts.length)),
    posts.length - 1,
  );
  window.location.href = `/art/${posts[postIndex].dataset.key}`;
});
