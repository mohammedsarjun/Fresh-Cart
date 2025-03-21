Dropzone.autoDiscover = !1;
const myDropzone = new Dropzone('#my-dropzone', {
  url: 'https://httpbin.org/post',
  maxFilesize: 5,
  acceptedFiles: 'image/*',
  addRemoveLinks: !0,
  autoProcessQueue: !0,
});
myDropzone.on('addedfile', function (o) {
  console.log('File added: ' + o.name);
}),
  myDropzone.on('removedfile', function (o) {
    console.log('File removed: ' + o.name);
  }),
  myDropzone.on('success', function (o, e) {
    console.log('File uploaded successfully:', e);
  });
