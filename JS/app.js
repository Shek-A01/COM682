//The URIs of the REST endpoint
IUPS = "https://prod-44.eastus.logic.azure.com:443/workflows/3fe202140c5a418b864033906ff8a42e/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ykwRBsZYSCSe1q4rB2pECDjAjdHHYveJ9TxuXpSRZRM";
RAI = "https://prod-38.eastus.logic.azure.com:443/workflows/717f5ed133384686b5b0963018ff21e8/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VhAHIkG-xwp-I-Qc5NfY22bkyPCYvC6qVPTAfHrTepk";
registerUserURL = "https://prod-57.eastus.logic.azure.com/workflows/61d9d2b9e9344d9cb7440e860be7235b/triggers/manual/paths/invoke/rest/v1/users?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=y_a3MqNwwKsPnwXjBySXm6Hl27DqDYRbllSn3GWRxsA"
checkUserURL = "https://prod-40.northeurope.logic.azure.com/workflows/993d71d2071d4f63a36f7b0c0e3057d1/triggers/manual/paths/invoke/rest/v1/users/{id}?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9dO_xBxWJ0lVyNK4wd1TdH-2rt07L3dhg344jUnv_v8"
BLOB_ACCOUNT = "https://blobstorageb00808261.blob.core.windows.net";
IMGDIA = "https://prod-28.northeurope.logic.azure.com/workflows/ed4ca2943df8453891d38c58e1cc001c/triggers/manual/paths/invoke/rest/v1/images/"
IMGDIA2 = "?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=XEnjJr9x_--dOclf1CBA4z_mx4BvRNPruujQgjhkpew"

//Handlers for button clicks
$(document).ready(function() {

 
  $("#retImages").click(function(){

      //Run the get asset list function
      getImages();

  }); 

  $("#logoutBtn").click(function(){

    //Clear session storage data
    sessionStorage.clear();
}); 

  $("#registerBtn").click(function(){

    createUserAccount();
  });

  $("#loginBtn").click(function(){

    checkUserAccount();
  });

   //Handler for the new asset submission button
  $("#subNewForm").click(function(){

    //Execute the submit new asset function
    submitNewAsset();
    
  }); 
});

//A function to submit a new asset to the REST endpoint 
function submitNewAsset(){



  //Create a form data object
  submitData = new FormData();


  //Get form variables and append them to the form data object
  submitData.append('FileName',$('#FileName').val());
  submitData.append('userID', sessionStorage.getItem('userID'));
  submitData.append('userName', sessionStorage.getItem('userName'));
  submitData.append('File',$('#UpFile')[0].files[0]);

  $.ajax({
    url: IUPS,
    data: submitData,
    cache: false,
    enetype: 'multipart/form-data',
    contentType: false,
    processData: false,
    type:'POST',
    success: function(data){
      alert('Image upload successful.');
      resetImageForm();
    }
  })
}

function resetForm() {
  // Assuming your form has an ID, adjust accordingly
  $('#loginForm')[0].reset();
}
function resetImageForm() {
  // Assuming your form has an ID, adjust accordingly
  $('#newAssetForm')[0].reset();
}

function checkUserAccount(){
  const userName = $('#userName').val();
  const userPassword = $('#userPassword').val();

  
  const submitData = {
    username: userName,
    userPassword: userPassword
  };

  $.ajax({
    url: checkUserURL,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(submitData),
    success: function (data) {
      if (Object.keys(data).length !== 0 && data.constructor === Object && data.Table1.length > 0) {
        const account = data.Table1[0];
        sessionStorage.setItem('userName', account.userName);
        sessionStorage.setItem('userID', account.userID);
        
        console.log('User logged in successfully', data);
        alert('Login successful, now redirecting to image sharing.');
        window.location.href = 'index.html';
      } else {
        alert('Error logging in. Please check your details and try again.');
        resetForm(); 
      }
    },
    error: function (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please check your details and try again.');
      resetForm(); 
    }
  })
}

//A function to submit a new asset to the REST endpoint 
function createUserAccount(){



  //Create a form data object
  const userName = $('#userName').val();
  const userPassword = $('#userPassword').val();

  
  const submitData = {
    username: userName,
    userPassword: userPassword
  };


  $.ajax({
    url: registerUserURL,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(submitData),
      success: function (data) {
        console.log('New user created successfully', data);
        alert('Account succesfully created!');
        window.location.href = 'index.html';
      },
      error: function (error) {
        console.error('Error creating new user.', error);
        alert('Failed to create account. Please try again.');
      }
  })
}

function deleteImage(imageId){

  // Get the image ID from the selected button's data-image-id attribute


  // Construct the DELETE request URL
  var url = IMGDIA + imageId + IMGDIA2;

  // Send an asynchronous DELETE request to the endpoint
  console.log("Image ID: ", $("#deleteThisImage").data('image-id'))
  $.ajax({
    url: url,
    type: 'DELETE',
    success: function (data, status, jqXHR) {
      if (jqXHR.status == 204) {
        alert('Image successfully deleted');
        getImages();
      } else {
        alert('Error deleting image');
        console.error('Error deleting image', data);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error deleting image: ', errorThrown);
      alert('Error deleting image');
    }
  });
}

function checkContentType(url, callback) {
   $.ajax({
       url: url,
       type: 'HEAD',
       success: function(data, status, xhr) {
           var contentType = xhr.getResponseHeader('Content-Type');
           callback(contentType);
       },
       error: function() {
           callback(null);
       }
   });
}

//A function to get a list of all the assets and write them to the Div with the AssetList Div
function getImages(){


//Replace the current HTML in that div with a loading message
$('#ImageList').html('<div class="spinner-border" role="status"><span class="sr-only">&nbsp;</span>');
$('#ImageList').on('click', '.deleteImage', function(){
  var imageId = $(this).data('image-id');
  deleteImage(imageId);
 });



$.getJSON(RAI, function( data ) {

 //Create an array to hold all the retrieved assets
 var items = [];


 //Iterate through the returned records and build HTML, incorporating the key values of the record in the data
 $.each(data, function(key, val) {
  items.push("<hr />");
  items.push("<img src='" + BLOB_ACCOUNT + val["filePath"] + "'width='350'/><br>");
  items.push("<b>File name:</b> " +val["fileName"]+"<br/>");
  items.push("<b>File uploaded by:</b> "+ val["userName"]+" "+"(user ID: "+val["userID"]+ ")<br>");
  items.push('<button type="button" class="deleteImage btn btn-danger" data-image-id="' + val["id"] + '">Delete</button>&nbsp');
});


 //Clear the assetlist div
 $('#ImageList').empty();


 //Append the contents of the items array to the ImageList Div
 $( "<ul/>", {
  "class": "my-new-list",
  html: items.join( "" )
  }).appendTo( "#ImageList" );
  });

  
}
