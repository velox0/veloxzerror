document.getElementsByClassName('post')[0].classList.add('open-post');
const posts = document.querySelectorAll('.post');
const postContainer = document.getElementById('post-container');

document.getElementById('post-container').addEventListener('mousemove', (e) => {
  const postContainerWidth = postContainer.offsetWidth;
  const mouseX = e.offsetX;
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

document.getElementById('post-container').addEventListener('click', (e) => {
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
