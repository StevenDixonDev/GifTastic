/*
  Home Work 6 - Giftastic

  Things I learned 

  - Jquery custom events
  - Passing arrays through the trigger event destructures them
  - I understand how $(this) works in Jquery now 
  - Bootstrap ordering
  - Local storage to keep the previous topics on the page
*/

$(document).ready(function () {
  // create array for buttons
  let buttons = [];
  // create a place holder for the last searched item
  let lastSearch = "";
  // set the limit for images returned
  let limit = 10;
  // get previous buttons from local storage
  let previousButtons = localStorage.getItem("buttons");
  // check if there were any previous buttons
  if (Array.isArray(JSON.parse(previousButtons))) {
    // if there were assign them to buttons
    buttons = JSON.parse(previousButtons);
  } else {
    // otherwise use defaults
    buttons = ["JavaScript", "CSS", "HTML", "Typing"];
  }

  // handle adding new button to buttons array 
  $('#new-button').on('click', function (e) {
    e.preventDefault();
    // trigger the add button event to handle making new buttons
    $(document).trigger('add-button', [buttons]);
  });

  // trigger size change
  $('#size-button').on('click', function (e) {
    e.preventDefault();
    // trigger the change size event to change the size of the next loaded gifs
    $(document).trigger('change-size');
  })

  // trigger event when gif is clicked on
  $(document).on('click', '.gifs', function (e) {
    e.preventDefault();
    // trigger gif click to change gif state from still to animated
    $(document).trigger('gif-click', $(this));
  })

  // trigger event when the buttons are clicked on
  $(document).on('click', '.custom-button', function (e) {
    e.preventDefault();
    // trigger the search event
    $(document).trigger('button-trigger', [$(this), limit]);
  })

  $(document).on('click', '.custom-button-removal', function (e) {
    e.preventDefault();
    // since this is inside of a parent with an event listener need to stop the parent from triggering
    e.stopPropagation();
    // trigger event to remove button from dom and buttons array
    $(document).trigger('remove-button', [$(this), buttons]);
  });

  $(document).on('click', '#more', function (e) {
    e.preventDefault();
    // trigger next page event to update dom and search
    $(document).trigger('next-page', [lastSearch, limit]);
  })

  // functions that change buttons will need to be addressed here
  $(document).on('remove-button', function (e, button, buttons) { buttons = removeButton(e, button, buttons) });
  $(document).on('add-button', function (e, buttons) { buttons = addButtons(e, buttons) });
  $(document).on('button-trigger', function (e, element, limit) { lastSearch = search(e, element, limit) });
  // function that subscribes custom events to document for events that don't change the buttons
  documentSubscribe(document);

  // render buttons for the first time
  $(document).trigger('update-buttons', [buttons]);
  $("#size-button").text($("#size-button").data('size'));
});


function documentSubscribe(el) {
  // adds custom events to DOM
  $(el).on('update-buttons', renderButtons);
  $(el).on('update-images', updateImages);
  $(el).on('gif-click', handleGifClick);
  $(el).on('change-size', changeImageSize);
  $(el).on('render-next', renderNextAndPrevious);
  $(el).on('next-page', moveToNextPage);
}

function addButtons(e, buttons) {
  if ($('#new-button-text').val() !== "") {
    // add text from input into button array
    buttons.push($('#new-button-text').val());
    // reset text in input feild
    $('#new-button-text').val("");
    // let the dom know the buttons were changes
    $(document).trigger('update-buttons', [buttons]);
    // then update local storage
    updateLocalStorage(buttons);
    return buttons;
  }
}

function changeImageSize(event, data) {
  // define list of sizes a button can be 
  const sizes = ["fixed_width", "fixed_height", "downsized", "original"];
  // get the current size from data attr
  let currentSize = $("#size-button").data('size');
  // get current index in sizes list
  let index = sizes.indexOf(currentSize);
  // increase the index
  index += 1;
  // make sure the index is not greater if it is set it to 0 
  if (index >= sizes.length) {
    index = 0;
  }
  // set the buttons attributes 
  $("#size-button").data('size', sizes[index]);
  $("#size-button").text(sizes[index]);
}

function search(event, element, limit) {
  let offset = 0;
  let thingToSearchFor = $(element).find("p").text();
  // ajax request to giphy for gifs
  giphyCall(limit, offset, thingToSearchFor).then((res) => {
    // tell the dom the data has been found
    $(document).trigger('update-images', [res.data]);
    $(document).trigger('render-next', res.pagination);
  });
  return thingToSearchFor;
}

function giphyCall(limit, offset, term) {
  return $.ajax({
    url: `https://api.giphy.com/v1/gifs/search?q=${term}&limit=${limit}&rating=pg&offset=${offset}&api_key=CcLtxrF0OzF1nH4I4jlUfsOp4TBYkmpT`,
    method: 'get'
  })
}

function updateImages(event, data) {
  // clear the images from the dom
  $('#gif-location').empty();
  let currentSize = $("#size-button").data('size');
  // add new images
  $.each(data, function (index, gif) {
    $('#gif-location').append(`
      <img class="gifs  m-1 p-1" data-gif-src="${gif.images[currentSize].url}" src="${gif.images[currentSize + '_still'].url}"/>
    `)
  })
}

function renderButtons(event, buttons) {
  // clear the buttons from the dom
  $('#button-area').empty();
  // append buttons to the button area
  $.each(buttons, function (index, button) {
    $('#button-area').append(`
    <div class="btn btn-outline-info btn-block custom-button d-flex flex-row justify-content-between" >
    <p>${button}</p>
    <button class="btn btn-sm btn-danger custom-button-removal" data-button-id="${index}">X</button>
    </div>`
    );
  });
}

function removeButton(e, button, buttons) {
  let index = $(button).data().buttonId;
  buttons.splice(index, 1);
  $(document).trigger('update-buttons', [buttons]);
  updateLocalStorage(buttons);
  return buttons;
}

function handleGifClick(event, element) {
  // get the current gif src
  let gif = $(element).data().gifSrc;
  // get the current still image
  let still = $(element).attr('src');
  // swap them
  $(element).data("gifSrc", still);
  $(element).attr('src', gif);
}

function updateLocalStorage(buttons) {
  localStorage.clear();
  localStorage.setItem('buttons', JSON.stringify(buttons));
}

function renderNextAndPrevious(event, page) {
  $("#gif-location").append(`
    <button class="btn btn-outline-primary btn-lg btn-block" id="more" data-page=${page.offset}>More</button> 
  `)
}

function moveToNextPage(e, lastSearch, limit) {
  let page = $("#more").data().page;
  page += limit;
  giphyCall(limit, page, lastSearch).then((res) => {
    // tell the dom the data has been found
    $(document).trigger('update-images', [res.data]);
    $(document).trigger('render-next', res.pagination);
  });
}