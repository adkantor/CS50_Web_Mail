document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit button
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    submit_email(); 
    load_mailbox('sent'); 
    event.preventDefault();
  });

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Create container
  const container = document.createElement('div');
  container.className = 'list-group';
  container.setAttribute('id', 'email-container')
  // Add container to DOM
  document.querySelector('#emails-view').append(container);

  // Fetch relevant emails from server
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // load content into emails-view
      emails.forEach(add_email);

  });

}

function submit_email() {
 
  // get data from form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // make API POST request
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result); 
  })
  // Catch any errors and log them to the console
  .catch(error => {
    console.log('Error:', error);
  }); 

}

// Create new email entry
function add_email(email) {  
  
  // box
  const box = document.createElement('div');
  box.className = `list-group-item list-group-item-action ${email.read ? 'bg-light' : ''}`;
  box.setAttribute('data-id', email.id);
  box.addEventListener('click', load_email);
  document.querySelector('#email-container').append(box);
  
  // Sender, Recipient
  const div = document.createElement('div');
  div.className = 'd-flex w-100 justify-content-between';
  box.append(div);
  const hFrom = document.createElement('h5');
  hFrom.className = 'mb-1';
  hFrom.innerHTML = `From: ${email.sender}`;
  div.append(hFrom);
  const hTo = document.createElement('h5');
  hTo.className = 'mb-1';
  hTo.innerHTML = `To: ${email.recipients.join(', ')}`;
  div.append(hTo);
  
  // date
  small = document.createElement('small');
  small.className = 'text-muted';
  small.innerHTML = `${email.timestamp}`;
  div.append(small);
  
  // subject
  p = document.createElement('p');
  p.className = 'mb-1';
  p.innerHTML = `${email.subject}`;
  box.append(p);

}

// displays one email
function load_email(event) {

  // Show the email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';  

  const id = event.currentTarget.dataset.id;

  // Mark email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  // Fetch relevant email from server
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      const container = document.querySelector('#single-email-view');
      // From
      const pFrom = document.createElement('p');
      pFrom.innerHTML = `<strong>From: </strong>${email.sender}`;
      container.append(pFrom);
      // To
      const pTo = document.createElement('p');
      pTo.innerHTML = `<strong>To: </strong>${email.recipients.join(', ')}`;
      container.append(pTo);
      // Subject
      const pSubject = document.createElement('p');
      pSubject.innerHTML = `<strong>Subject: </strong>${email.subject}`;
      container.append(pSubject);
      // Timestamp
      const pTimestamp = document.createElement('p');
      pTimestamp.innerHTML = `<strong>Timestamp: </strong>${email.timestamp}`;
      container.append(pTimestamp);
      // Reply button
      const btnReply = document.createElement('button');
      btnReply.className = 'btn btn-sm btn-outline-primary';
      btnReply.setAttribute('id', 'reply');
      btnReply.innerHTML = 'Reply';
      // TODO: attach event handler
      container.append(btnReply);

      container.append(document.createElement('hr'));

      // Body
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'mb-3'
      container.append(bodyDiv);
      const bodyText = document.createElement('textarea');
      bodyText.setAttribute('rows', "3");
      bodyText.className = "form-control";
      bodyText.innerHTML = email.body;
      bodyText.readOnly = true;
      container.append(bodyText);

  });
}