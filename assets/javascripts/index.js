/*
  Home Work 6 - Giftastic

  Things I learned 

  - Jquery custom events
  - Passing arrays through the trigger event destructures them
  - I understand how $(this) works in Jquery now 
  
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
      $('#new-button-text').val("")
      // let the dom know the buttons were changes
      $(document).trigger('update-buttons', [buttons]);
    }
  });
  
  // trigger event when gif is clicked on
  $(document).on('click', '.gifs', function(e){
      $(document).trigger('gif-click', $(this));
  })

  // trigger event when the buttons are clicked on
  $(document).on('click', '.custom-button', function(event){
    $(document).trigger('button-trigger', $(this).text());
  })

  // render buttons for the first time
  $(document).trigger('update-buttons', [buttons]);
});


function documentSubscribe(el){
  // adds custom events to DOM
  $(el).on('update-buttons', renderButtons);
  $(el).on('update-images', updateImages);
  $(el).on('button-trigger', search);
  $(el).on('gif-click', handleGifClick);
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
  // add new images
  $.each(data.data, function(index, gif){
    $('#gif-location').append(`
    <div class="col-sm-3 mt-1">
      <img class="gifs img-fluid m-0 p-0" data-gif-src="${gif.images['fixed_width'].url}" src="${gif.images['fixed_width_still'].url}"/>
    </div>
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