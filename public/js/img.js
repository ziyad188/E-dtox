// Handle the form submission
$('form').submit(function (event) {
  event.preventDefault();
  const formData = new FormData(this);

  $.ajax({
    url: '/process-image',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      // Process the classification results
      const predictions = response.predictions;
      // Display the results on the page
      // ...
    },
    error: function (error) {
      console.error('Error processing image:', error);
      // Handle error case
      // ...
    },
  });
});
