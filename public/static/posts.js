const posts = document.querySelectorAll('.post');
const postContainer = document.getElementById('post-container');

let openPostIndex = -1;
let startX = 0;
let startY = 0;

document.getElementById('post-container').addEventListener('mousemove', (e) => {
  openPostIndex = -1;
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

// for mobile devices
document
  .getElementById('post-container')
  .addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

document.getElementById('post-container').addEventListener('touchmove', (e) => {
  // if the touch moved more vertically than horizontally, don't do anything
  if (
    Math.abs(e.changedTouches[0].clientY - startY) /
      Math.abs(e.changedTouches[0].clientX - startX) >
    0.75
  ) {
    return;
  }
  if (openPostIndex == -1) openPostIndex = 0;
  // on right swipe, go to next post
  const threshold = window.innerWidth / posts.length / 2;
  if (e.changedTouches[0].clientX > startX + threshold) {
    openPostIndex++;
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }
  // on left swipe, go to previous post
  else if (e.changedTouches[0].clientX < startX - threshold) {
    openPostIndex--;
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }
  if (openPostIndex < 0) {
    openPostIndex = 0;
  } else if (openPostIndex >= posts.length) {
    openPostIndex = posts.length - 1;
  }
  document.body.style.setProperty(
    '--bg-color',
    posts[openPostIndex].dataset.color,
  );
  for (let i = 0; i < posts.length; i++) {
    if (i === openPostIndex) {
      posts[i].classList.add('open-post');
    } else {
      posts[i].classList.remove('open-post');
    }
  }
});

document.getElementById('post-container').addEventListener('mouseleave', () => {
  document.body.style.setProperty('--bg-color', 'var(--color-bg)');
});

document.getElementById('post-container').addEventListener('click', (e) => {
  if (window.innerWidth < 768) return;
  if (!done) return;
  if (openPostIndex !== -1) {
    window.location.href = `/art/${posts[openPostIndex].dataset.key}`;
    return;
  }
  const postContainerWidth = postContainer.offsetWidth;
  const mouseX = e.clientX - postContainer.offsetLeft;
  const postIndex = Math.min(
    Math.max(0, Math.floor((mouseX / postContainerWidth) * posts.length)),
    posts.length - 1,
  );
  window.location.href = `/art/${posts[postIndex].dataset.key}`;
});
