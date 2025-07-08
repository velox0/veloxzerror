const posts = document.querySelectorAll('.post');
const postContainer = document.getElementById('post-container');

document.getElementById('post-container').addEventListener('mousemove', (e) => {
  if (window.innerWidth < 768) return;
  const postContainerWidth = postContainer.offsetWidth;
  const mouseX = e.clientX - postContainer.offsetLeft;
  const postIndex = Math.min(
    Math.max(0, Math.round((mouseX / postContainerWidth) * posts.length)),
    posts.length - 1,
  );
  posts.forEach((post, index) => {
    if (index === postIndex) {
      post.classList.add('open-post');
      // set pseudo element background color
      document.body.style.setProperty('--bg-color', post.dataset.color);
      console.log(post.dataset.color);
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
  console.log(e.target);
  const postContainerWidth = postContainer.offsetWidth;
  const mouseX = e.offsetX;
  const postIndex = Math.min(
    Math.max(0, Math.round((mouseX / postContainerWidth) * posts.length)),
    posts.length - 1,
  );
  console.log(posts[postIndex].dataset.key);
  // go to post index page
  window.location.href = `/art/${posts[postIndex].dataset.key}`;
});
