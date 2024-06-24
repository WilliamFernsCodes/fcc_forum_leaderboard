// urls used for fetching data, along with displaying the right assets and links
const forumLatest = "https://cdn.freecodecamp.org/curriculum/forum-latest/latest.json"; // url to get the latest forum news
const forumTopicUrl = "https://forum.freecodecamp.org/t/"; // base forum topic url. 
const forumCategoryUrl = "https://forum.freecodecamp.org/c/"; // base forum category url
const avatarUrl = "https://sea1.discourse-cdn.com/freecodecamp"; // base avatar url

// select the postContainer, as we will insert table rows into the tbody
const postsContainer = document.getElementById("posts-container");

// all categories. Key is category id, and value is a dictionary with a category and a className.
const allCategories = {
  299: { category: "Career Advice", className: "career" },
  409: { category: "Project Feedback", className: "feedback" },
  417: { category: "freeCodeCamp Support", className: "support" },
  421: { category: "JavaScript", className: "javascript" },
  423: { category: "HTML - CSS", className: "html-css" },
  424: { category: "Python", className: "python" },
  432: { category: "You Can Do This!", className: "motivation" },
  560: { category: "Backend Development", className: "backend" },
};

// get the anchor tag as a string, by passing in the forum category id.
const forumCategory = (id) => {
  let selectedCategory = {}; // store the selected category information
  // if the category has the key of id. Using the hasOwnProperty method.
  if (allCategories.hasOwnProperty(id)) { 
    const { category, className } = allCategories[id]; // if so, destructure the category and className as variables.
    // set the selectedCategory category and className to the destructured variables above.
    selectedCategory.category = category; 
    selectedCategory.className = className;
  } 
  // else, if the allCategories doesn't have the id.
  else {
    // set the className and category to "general"
    selectedCategory.className = "general";
    selectedCategory.category = "General";
    // set the category id to 1 
    selectedCategory.id = 1;
  }
  // make the url for the category.
  const url = `${forumCategoryUrl}${selectedCategory.className}/${id}`
  const linkText = selectedCategory.category; // variable to store textContent of the link/anchor element.
  const linkClass = `category ${selectedCategory.className}` // set the link class to `category "className"`, so that it gives the right styles.
  // make the anchor tag as a string, and return it.
  return `<a href="${url}" class="${linkClass}" target="_blank">${linkText}</a>`
}

// function to return how long ago the passed in time argument is, to the current time. 
const timeAgo = (time) => {
  const currentTime = new Date(); // get the current time in unix timestamp as numbers
  const lastPost = new Date(time); // get the lastPost timestmamp in unix timestamp as numbers 

  const timeDifference = currentTime - lastPost; // get the difference in miliseconds
  const msPerMinute = 1000 * 60; // utility/constant variable to get the total miliseconds per minute, to simplify things

  const minutesAgo = Math.floor(timeDifference / msPerMinute); // get time difference in minutes.
  const hoursAgo = Math.floor(minutesAgo / 60); // get time difference in hours
  const daysAgo = Math.floor(hoursAgo / 24); // get time differencv ein days

  // conditionals to return the correct string.
  if (minutesAgo < 60) { // if it is less than an hour ago, return in minutes
    return `${minutesAgo}m ago`;
  }

  if (hoursAgo < 24) { // if it is less than a day ago, return in hours
    return `${hoursAgo}h ago`;
  }

  return `${daysAgo}d ago`; // else, return in days.
};

// return viewCount in a better, formatted way.
const viewCount = (views) => {
  // get view count in thousands. For example, 5082 will be 5
  const thousands = Math.floor(views / 1000);

  // if the views is bigger or equal to 1000, return in "${thousands}k" format. 
  if (views >= 1000) {
    return `${thousands}k`;
  }

  // else, if it is smaller, just return the view count.
  return views;
};

// function to return all the avaters for a specific post
// It takes in all the posters, and all the users. It returns all the image tags.
const avatars = (posters, users) => {
  // map through the posters, see if there is a user with the current poster id, and return an image if there is.
  return posters.map(poster => {
    // find the user, if there is a user with the same id as the poster.user_id.
    const user = users.find(user => user.id === poster.user_id);
    // if there is a user, return an image tag as string.
    if (user) {
      // the user.avatar_template url looks something like this: "/user_avatar/forum.freecodecamp.org/sergio.am.spina/{size}/359956_2.png"
      // replace teh "{size}" with 30.
      const avatar = user.avatar_template.replace(/{size}/, 30) // replace the size with 
      // The avatar link can either be a relative or absolute path. It can either be one of the following formats:
      // 1. "/user_avatar/forum.freecodecamp.org/sergio.am.spina/{size}/359956_2.png"
      // 2. "https://avatars.discourse-cdn.com/v4/letter/l/eb9ed0/{size}.png"
      // We want to make sure the relative paths are converted to absolute paths.
      const userAvatarUrl = avatar.startsWith("/user_avatar/") ? avatarUrl.concat(avatar) : avatar;
      return `<img src="${userAvatarUrl}" alt="${user.name}" />`
    }
  }).join(""); // join them all together to be a string, not a string array.
}

// function to fetch all the latest form posts. It is asynchronous, meaning that we can use "await" to wait for the promise to resolve before going to the next step.
// in the console, it logs the things in order of "1, 3, 2". This means that it doesn't wait for "fetchData" to complete before logging the next step.
const fetchData = async () => {
  try {
    const res = await fetch(forumLatest);
    const data = await res.json();
    showLatestPosts(data);
    console.log("2");
  } catch (err) {
    console.log(err);
  }
};

console.log("1");
fetchData();
console.log("3")

// function to show latest posts on the page, by setting the innerHTML for postsContainer. It takes in the data fetched by fetchData function.
const showLatestPosts = (data) => {
  const { topic_list, users } = data; // destructure the topic_list and users.
  const { topics } = topic_list; // destructure topics from topic_list

  // set the postsContainer innerHTML. Map through topics, access the current child, with the variable "item".
  postsContainer.innerHTML = topics.map((item) => {
    // destructure all necessary values from the item.
    const {
      id,
      title,
      views,
      posts_count,
      slug,
      posters,
      category_id,
      bumped_at,
    } = item;

    // return a table row, with all the data
    return `
    <tr>
      <td>
        <a target="_blank" href="${forumTopicUrl}${slug}/${id}" class="post-title">${title}</a>
        ${forumCategory(category_id)}
      </td>
      <td>
        <div class="avatar-container">
          ${avatars(posters, users)}
        </div>
      </td>
      <td>${posts_count - 1}</td>
      <td>${viewCount(views)}</td>
      <td>${timeAgo(bumped_at)}</td>
    </tr>`;
  }).join(""); // join the array of <tr> strings array together into one string.
};
