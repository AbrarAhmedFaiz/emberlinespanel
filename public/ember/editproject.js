$( function() {
    $( "#gallery-items" ).sortable({
        placeholder: "sortable-placeholder",
        forcePlaceholderSize: true,
        classes: {
            "ui-sortable": "highlight"
        }
    });
    $( "#gallery-items" ).disableSelection();
} );
// Class definition
var KTDropzoneDemo = function () {    
    // Private functions
    var demos = function () {
        // single file upload
        Dropzone.options.kDropzoneOne = {
            paramName: "file", // The name that will be used to transfer the file
            transformFile: function(file, done) { },
            maxFiles: 15,
            autoProcessQueue: false,
            maxFilesize: 25, // MB
            addRemoveLinks: true,
            acceptedFiles: "image/*",
            timeout: 500000,
            url: 'saveProject',
            removedfile: function(file) {
                var x = confirm('Are you sure you want to Delete?');
                if(!x)  return false;
                console.log(this)
                $.ajax({
                    url: "/admin/project/remove/image/" + file.projectId, //your php file path to remove specified image
                    type: "DELETE",
                    data: {
                        imageId: file.imageId,
                        type: 'delete',
                        _token: $('input[name="_token"]').val()
                    },
                    success: function (res, textStatus, xhr) {
                        console.log(res);
                        if (xhr.status == 200)
                        {
                            file.previewElement.remove();
                            showToaster("Image removed Successfully!","success");
                        }
                    },
                    error: function(xhr, error){
                        let errorMessage = JSON.parse(xhr.responseText);
                        showToaster(errorMessage.errors.title[0],"warning");
                    }
                });
            },
            init: function() {
                var myDropzone = this;

                // Add Project Saved files to Dropzone
                projectGallery.forEach(function(item,index) {
                    // Create the mock file:
                    var mockFile = item;

                    // Call the default addedfile event handler
                    myDropzone.emit("addedfile", mockFile);

                    // And optionally show the thumbnail of the file:
                    myDropzone.emit("thumbnail", mockFile, mockFile.cloudUrl);

                    // Make sure that there is no progress bar, etc...
                    myDropzone.emit("complete", mockFile);

                    // If you use the maxFiles option, make sure you adjust it to the
                    // correct amount:
                    var existingFileCount = 1; // The number of files already uploaded
                    myDropzone.options.maxFiles = myDropzone.options.maxFiles - existingFileCount;
                }) 


                $(".save_project").click(function (e) {
                    e.preventDefault();
                    var form = $('#project-form')[0]; // You need to use standard javascript object here
                    var formData = new FormData(form);
                    // myDropzone.processQueue();
                    var galleryFiles = myDropzone.files;
                    galleryFiles.forEach(function(image, i) {
                        formData.append('gallery_' + i, image);
                    });

                    console.log($.trim($("#categories").val()));

                    if($.trim($("#title").val()) == "" || $.trim($("#description").val()) == "" || $.trim($("#categories").val()) == "") {
                        var alert = $('#project_form_msg');
                        alert.parent().removeClass('kt-hide').show();
                        KTUtil.scrollTop();
                        setTimeout(()=>{
                            alert.parent().fadeOut();
                        },3000);
                        return;
                    }
                    formData.append('X-CSRF-TOKEN',$('input[name="_token"]').val());
                    var idsInOrder = $("#gallery-items").sortable("toArray");
                    console.log(idsInOrder);
                    
                    var sortAndGrid = [];
                    for (position = 0; position < idsInOrder.length; ++position) {
                       let galleryImageId =  $("#" + idsInOrder[position]).attr('data-image-id');
                       let grid = $('input[name="grid-' + galleryImageId + '"]:checked').val();
                       sortAndGrid.push({imageId:galleryImageId,sequence:position+1,grid: grid});
                    }
                    formData.append('sortAndGrid', JSON.stringify( sortAndGrid ));
                    
                    KTApp.block('#block_app', {
                        overlayColor: '#000000',
                        type: 'v2',
                        state: 'success',
                        message: 'Please wait...'
                    });
                    
                    $.ajax({
                        url: '/saveProject',
                        data: formData,
                        type: 'post',
                        dataType: 'json',
                        contentType: false, 
                        processData: false, 
                        success: function (res, textStatus, xhr) {
                            console.log(res);
                            KTApp.unblock('#block_app');
                            if (xhr.status == 200)
                            {
                                showToaster("Project updated Successfully!","success");
                            }
                            // setTimeout(()=>{
                            //     window.location.href = "/admin/projects";
                            // },2000)
                        },
                        error: function(xhr, error){
                            KTApp.unblock('#block_app');
                            let errorMessage = JSON.parse(xhr.responseText);
                            showToaster(errorMessage.errors.title[0],"warning");
                        }
                    });
                });
            },
            accept: function(file, done) {
                if (file.name == "justinbieber.jpg") {
                    done("Naha, you don't.");
                } else { 
                    done(); 
                }
            }   
        };
    }

    return {
        // public functions
        init: function() {
            demos(); 
        }
    };
}();

KTDropzoneDemo.init();


