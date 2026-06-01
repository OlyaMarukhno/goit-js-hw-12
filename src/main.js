import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const form = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.load-more-btn');

let searchQuery = '';
let page = 1;
const perPage = 15;

form.addEventListener('submit', handleSearch);
loadMoreBtn.addEventListener('click', handleLoadMore);

async function handleSearch(event) {
  event.preventDefault();

  searchQuery = event.currentTarget.elements.userQuery.value.trim();

  if (!searchQuery) {
    iziToast.warning({ message: 'Будь ласка, введіть слово для пошуку!' });
    return;
  }

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(searchQuery, page);

    if (data.hits.length === 0) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }

    createGallery(data.hits);

    const totalPages = Math.ceil(data.totalHits / perPage);

    if (totalPages > 1) {
      showLoadMoreButton();
    } else {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({ message: 'Сталася помилка при завантаженні даних.' });
    console.error(error);
  } finally {
    hideLoader();
    form.reset(); 
  }
}

async function handleLoadMore() {
  page += 1; 

  hideLoadMoreButton(); 
  showLoader(); 

  try {
    const data = await getImagesByQuery(searchQuery, page);
  
    createGallery(data.hits);

    const maxPage = Math.ceil(data.totalHits / perPage);

    if (page >= maxPage) {
      hideLoadMoreButton(); 
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      showLoadMoreButton();
    }

    smoothScroll();

  } catch (error) {
    iziToast.error({ message: 'Не вдалося завантажити додаткові зображення.' });
    console.error(error);
  } finally {
    hideLoader(); 
  }
}


function smoothScroll() {
  const galleryItem = document.querySelector('.gallery-item');
  
  if (galleryItem) {
    const { height: cardHeight } = galleryItem.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth', 
    });
  }
}