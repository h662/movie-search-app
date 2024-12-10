import { API_URL } from "./config.js";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const moviesContainer = document.getElementById("movies-container");
const favoritesContainer = document.getElementById("favorites-container");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function searchMovies(query) {
  try {
    const response = await fetch(`${API_URL}&s=${query}`);
    const data = await response.json();

    if (data.Response === "True") {
      displayMovies(data.Search);
    } else {
      moviesContainer.innerHTML = `<p>No result found.</p>`;
    }
  } catch (error) {
    console.error("Error fetching movies:", error);

    moviesContainer.innerHTML = `<p>Error fetching movies. Please try again.</p>`;
  }
}

function displayMovies(movies) {
  moviesContainer.innerHTML = "";

  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.innerHTML = `
      <img src="${
        movie.Poster !== "N/A" ? movie.Poster : "assets/no-image.png"
      }" alt="${movie.Title}" />
      <h3>${movie.Title}</h3>
      <button class="favorite-btn">${
        favorites.includes(movie.imdbID)
          ? "Remove from Favorites"
          : "Add to Favorites"
      }</button>
    `;

    movieCard.addEventListener("click", (e) => {
      if (e.target.classList.contains("favorite-btn")) {
        toggleFavorite(movie.imdbID);

        e.target.textContent = favorites.includes(movie.imdbID)
          ? "Remove from Favorites"
          : "Add to Favorites";

        e.stopPropagation();
      } else {
        window.location.href = `details.html?id=${movie.imdbID}`;
      }
    });

    moviesContainer.appendChild(movieCard);
  });
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter((favId) => favId !== id);
  } else {
    favorites.push(id);
  }

  updateFavorites();
}

async function updateFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));

  favoritesContainer.innerHTML = "";

  for (const id of favorites) {
    const movie = await fetchMovieById(id);
    const favoriteCard = document.createElement("div");
    favoriteCard.className = "movie-card";
    favoriteCard.innerHTML = `
      <img src="${
        movie.Poster !== "N/A" ? movie.Poster : "assets/no-image.png"
      }" alt="${movie.Title}" />
      <h3>${movie.Title}</h3>
      <button class="remove-btn">Remove</button> 
    `;

    favoriteCard.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-btn")) {
        toggleFavorite(movie.imdbID);

        e.stopPropagation();
      } else {
        window.location.href = `details.html?id=${movie.imdbID}`;
      }
    });

    favoritesContainer.appendChild(favoriteCard);
  }
}

async function fetchMovieById(id) {
  try {
    const response = await fetch(`${API_URL}&i=${id}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();

  if (query) {
    searchMovies(query);
  }
});

updateFavorites();
