async function showFile(code) {
  try {
    const results = await fetch(`/api/fileData/${code}`);
    const responses = await results.json();
    let buttonAux = '';
    const parentDoc = document.getElementById('dataListing');
    parentDoc.innerHTML = '';
    for (let i = 0; i < responses.length; i += 1) {
      const fileName = `${responses[i].fileName}`;
      const form = document.createElement('form');
      form.setAttribute('action', '/download');
      form.setAttribute('method', 'POST');
      form.setAttribute('enctype', 'multipart/form-data');
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('value', `${fileName}`);
      input.setAttribute('name', 'fileName');
      buttonAux = document.createElement('button');
      buttonAux.setAttribute('type', 'submit');
      buttonAux.innerHTML = fileName;
      form.appendChild(input);
      form.appendChild(buttonAux);
      parentDoc.appendChild(form);
    }
  } catch (err) {
    console.log(err);
  }
}

async function fileDeletion(name) {
  const parentDoc = document.getElementById(name);
  const messages = document.getElementById('endMessage');
  const s = name.split('/').pop();
  try {
    fetch(`/api/fileDownload/${s}`);
    messages.innerHTML = 'Deleted succesfully';
    parentDoc.remove();
  } catch (err) {
    messages.innerHTML = 'Unsuccesful deletion';
    console.log(err);
  }
}
