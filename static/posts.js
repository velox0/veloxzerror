document.getElementsByClassName('post')[0].classList.add('open-post');

document.getElementById('post-container').addEventListener('mousemove', (e) => {
  if (e.target.id !== 'post-container') return;
  const posts = document.querySelectorAll('.post');
  const postContainer = document.getElementById('post-container');
  const postContainerWidth = postContainer.offsetWidth;
  const mouseX = e.clientX;
  const postIndex = Math.min(
    Math.max(0, Math.round((mouseX / postContainerWidth) * posts.length)),
    posts.length - 1,
  );
  posts.forEach((post, index) => {
    if (index === postIndex) {
      post.classList.add('open-post');
    } else {
      post.classList.remove('open-post');
    }
  });
});
