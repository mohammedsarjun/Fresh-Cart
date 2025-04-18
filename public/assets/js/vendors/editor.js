var quill,
  editorElement = document.querySelector('#editor');
editorElement &&
  (quill = new Quill(editorElement, {
    modules: {
      toolbar: [
        [{ header: [1, 2, !1] }],
        [{ font: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ size: ['small', !1, 'large', 'huge'] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }, { align: [] }],
        ['link', 'image', 'code-block', 'video'],
      ],
    },
    theme: 'snow',
  }));
