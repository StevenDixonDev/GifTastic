/*
  Home Work 6 - Giftastic

  Things I learned 

  - Jquery custom events
  - Passing arrays through the trigger event destructures them
  - I understand how $(this) works in Jquery now 
  - Bootstrap ordering

*/
$(document).ready(function(){

  // create array for buttons
  const buttons = ["arm bird", "crazy", "WTF"];
  // function that subscribes custom events to document
  documentSubscribe(document);
  // handle adding new button to buttons array 
  $('#new-button').on('click', function(e){
    e.preventDefault();
    if($('#new-button-text').val() !== ""){
      // add text from input into button array
      buttons.push($('#new-button-text').val());
      // reset text in input feild
      $('#new-button-text').val("");
      // let the dom know the buttons were changes
      $(document).trigger('update-buttons', [buttons]);
    }
  });

  $('#size-button').on('click', function(e){
    e.preventDefault();
    $(document).trigger('change-size');
  })

  // trigger event when gif is clicked on
  $(document).on('click', '.gifs', function(e){
      e.preventDefault();
      $(document).trigger('gif-click', $(this));
  })

  // trigger event when the buttons are clicked on
  $(document).on('click', '.custom-button', function(e){
    e.preventDefault();
    $(document).trigger('button-trigger', $(this).text());
  })

  // render buttons for the first time
  $(document).trigger('update-buttons', [buttons]);
  $("#size-button").text($("#size-button").data('size'))
});


function documentSubscribe(el){
  // adds custom events to DOM
  $(el).on('update-buttons', renderButtons);
  $(el).on('update-images', updateImages);
  $(el).on('button-trigger', search);
  $(el).on('gif-click', handleGifClick);
  $(el).on('change-size', changeImageSize);
}

function changeImageSize(event, data){
  const sizes = ["fixed_width", "fixed_height", "downsized", "original"];
  let currentSize = $("#size-button").data('size');
  let index = sizes.indexOf(currentSize);

  index+=1;

  if(index >= sizes.length){
    index = 0;
  }

  $("#size-button").data('size', sizes[index]);
  $("#size-button").text(sizes[index]);
}

function search(event, thingToSearchFor){
  // ajax request to giphy for gifs
  $.ajax({
    url: `https://api.giphy.com/v1/gifs/search?q=${thingToSearchFor}&limit=10&api_key=CcLtxrF0OzF1nH4I4jlUfsOp4TBYkmpT`,
    method: 'get'
  }).then((res)=>{
    // tell the dom the data has been found
    console.log(res)
    $(document).trigger('update-images', res);
  });
}

function updateImages(event, data){
  // clear the images from the dom
  $('#gif-location').empty();
  let currentSize = $("#size-button").data('size');
  // add new images
  $.each(data.data, function(index, gif){
    $('#gif-location').append(`
      <img class="gifs  m-1 p-1" data-gif-src="${gif.images[currentSize].url}" src="${gif.images[currentSize+'_still'].url}"/>
    `)
  })
}

function renderButtons(event, buttons){
  // clear the buttons from the dom
  $('#button-area').empty();
  // append buttons to the button area
  $.each(buttons, function(index, button){
    $('#button-area').append(`<button class="btn btn-secondary btn-lg btn-block custom-button">${button}</button>`);
  });
}

function handleGifClick(event, element){
  // get the current gif src
  let gif = $(element).data().gifSrc;
  // get the current still image
  let still = $(element).attr('src');

  // swap them
  $(element).data("gifSrc", still);
  $(element).attr('src', gif);
}