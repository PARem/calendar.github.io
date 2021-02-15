const weekDay = {
  'mon': 1,
  'tue': 2,
  'wen': 3,
  'thu': 4,
  'fri': 5
};
const dayTime = {
  '10': 1,
  '11': 2,
  '12': 3,
  '13': 4,
  '14': 5,
  '15': 6,
  '16': 7,
  '17': 8,
  '18': 9
};
const IndexPath = '/calendar/index.html';
const table = document.getElementsByClassName('table')[0];
const select = document.getElementById('select');
let currentMeet;
let startUserMeetings;
let closeTd = {};
let errorMessage = [];
let expanded = true;
/***************************interaction with localStorage*************************************/
//add userMeetings from localStorage
const addUserMeetings = () => {
  let userMeetings = {
    'Bob': {},
    'Alex': {},
    'Maria': {}
  };

  return JSON.parse(localStorage.getItem('userMeetings')) || userMeetings;
};
// set userMeetings to localStore
const setUserMeetings = (userMeetings) => {
  localStorage.setItem('userMeetings', JSON.stringify(userMeetings));
};

/************************close meetings************************************/
// swaps the key with the value of the object
const swapObj = (obj) => {
  const res = {};

  Object.keys(obj).forEach(function(value) {
    let key = obj[value];
    res[key] = value;
  });
  return res;
};
// convert date from number cell and row
const convertDate = (cellIndex, rowIndex) => {
  const reverseDay = swapObj(weekDay);
  const reverseTime = swapObj(dayTime);
  return reverseDay[cellIndex] + ' ' + reverseTime[rowIndex];
};
// get cell and row index and return date
const getDate = function(td) {
  let tr = td.parentNode;
  let day = td.cellIndex;
  let time = tr.rowIndex;

  return convertDate(day, time);
};
// delete event
const deleteEvent = (td, userMeetings) => {
  let date = getDate(td);
  let persons = td.querySelector('.meeting').getAttribute('data-user').split(' ');

  persons.forEach((person) => {
    delete userMeetings[person][date];
  });
  setUserMeetings(userMeetings);
};
// function receives and passes the required data to the function deleteEvent()
const closeEvent = function() {
  const userMeetings = addUserMeetings();
  deleteEvent(closeTd, userMeetings);
  fillTable();
};
const getCloseMeeting = function() {
  closeTd = this.parentNode.parentNode;
};
// function is called on the event of clicking on the button to close the meeting.
const closeMeetings = () => {
  const closeMeeting = document.querySelector('.modal-close');
  const closeButtons = document.querySelectorAll('.meeting .close');

  closeMeeting.addEventListener('click', closeEvent);
  closeButtons.forEach((button) => {
    button.addEventListener('click', getCloseMeeting);
  });
};
/***************************dropAndDrag meetings****************************************/
//function removes meeting at start of drag event
const chooseUserMeetings = function () {
  currentMeet = this;
  startUserMeetings = addUserMeetings();
};

// hides the element being dragged
const dragStart = function() {
  setTimeout(() => {
    this.classList.add('hide');
  }, 0);
};
// shows the element that was dragged
const dragEnd = function() {
  this.classList.remove('hide');
};

const dragOver = function(e) {
  e.preventDefault();
};
//shows the table cell where the element will be moved. Add this cell class hover
const dragEnter = function() {
  this.classList.add('hover');
};
// delete class hover when live cell
const dragLeave = function() {
  this.classList.remove('hover');
};
// change object in localStorage when drop meeting
const changeUserMeetings = (newMeet) => {
  const userMeetings = addUserMeetings();
  let persons = newMeet.querySelector('.meeting').getAttribute('data-user').split(' ');
  let meetTitle = currentMeet.querySelector('.todo').textContent;
  let newDate = getDate(newMeet);

  persons.forEach((person) => {
    userMeetings[person][newDate] = meetTitle;
  });
  setUserMeetings(userMeetings);
};
// add event in the cell
const dragDrop = function() {
  if(this.hasChildNodes()) {
    setUserMeetings(startUserMeetings);
    return false;
  }
  deleteEvent(currentMeet.parentNode, startUserMeetings);
  this.append(currentMeet);
  changeUserMeetings(this);
  this.classList.remove('hover');

};

const dropAndDrag = () => {
  const meetEvents = document.querySelectorAll('.meeting');
  const cells = document.querySelectorAll('.table td');

  cells.forEach((cell) => {
    cell.addEventListener('dragover', dragOver);
    cell.addEventListener('dragenter', dragEnter);
    cell.addEventListener('dragleave', dragLeave);
    cell.addEventListener('drop', dragDrop);
  });

  meetEvents.forEach(function(meetEvent){
    meetEvent.addEventListener('mousedown', chooseUserMeetings);
    meetEvent.addEventListener('dragstart', dragStart);
    meetEvent.addEventListener('dragend', dragEnd);

  });
};
/****************************create table*********************************************/
// clear data from table
const clearTable = function() {
  const rowsLength = table.rows.length;
  const cellsLength = table.rows[0].cells.length;

  for(let row = 1; row < rowsLength; row++){
    for(let cell = 1; cell < cellsLength; cell++) {
      table.rows[row].cells[cell].innerHTML = '';
    }
  }
};
// create node
const createNode = (dataUser, meetTitle) => {
  return `<div class="meeting" draggable="true" data-user="${dataUser}" >
            <span class="todo">${meetTitle}</span>
            <button class="close" data-bs-toggle="modal" data-bs-target="#modal"><i class="fas fa-times"></i></button>
          </div>`;
};
//fills the cell
const fillCell = (meetings, person) => {
  for(let event in meetings) {
    let [day, time] = event.split(' ');
    let numCell = weekDay[day];
    let numRow = dayTime[time];

    if(!table.rows[numRow].cells[numCell].hasChildNodes()) {
      table.rows[numRow].cells[numCell].innerHTML = createNode(person, meetings[event]);
    }else {
      let users = table.rows[numRow].cells[numCell].childNodes[0].getAttribute('data-user');
      let persons = users + ' ' + person;

      table.rows[numRow].cells[numCell].innerHTML = createNode(persons, meetings[event]);
    }
  }
  dropAndDrag();
  closeMeetings();
};
// fill table
const fillTable = function() {
  clearTable();
  const user = select.value;
  const userMeetings = addUserMeetings();

  if(user === 'all') {
    for(let person in userMeetings) {
      fillCell(userMeetings[person], person);
    }
  }else {
    fillCell(userMeetings[user], user);
  }
};
/*************************Checkbox in select**********************************/
// show and hide checkboxes in select
function showCheckboxes() {
  let checkboxes = document.getElementById('checkboxes');

  if (!expanded) {
    checkboxes.style.display = "block";
    expanded = true;
  } else {
    checkboxes.style.display = "none";
    expanded = false;
  }
}
/*******************************Close select with checkbox********************************/
//function close select with checkboxes when clicking outside the field
const toggleSelector = function(e) {
  let checkboxes = document.getElementById('checkboxes');
  if(checkboxes.style.display === "block"
    && !(e.target.className === 'form-check')
    && !(e.target.className === 'form-check-input')
    && !(e.target.className === 'form-check-label')) {
    checkboxes.style.display = "none";
    expanded = false;
  }
};
/******************************Create event**********************************************/
//function checks the date for uniqueness
const checkTimeAndDayEvent = (checkDate) => {
  let userMeetings = addUserMeetings();
  let dateSet = new Set();
  for(let person in userMeetings) {
    for(let date in userMeetings[person]) {
      dateSet.add(date);
    }
  }
  return !dateSet.has(checkDate);
};
// show error message
const showErrorMessage = () => {
  let span = document.querySelector('.error-message span');
  let div = document.querySelector('.error-message');
  let messages = errorMessage.join(' ');

  div.classList.remove('visually-hidden');
  span.innerHTML = messages;
};
// validation form( title meeting and person)
const validationForm = (meetingName, checkedPersons) => {
  errorMessage = [];
  let countChecked = 0;
  let inputName = document.querySelector('.form-group input[type=text]');
  let inputParticipants = document.querySelector('.overSelect');

  checkedPersons.forEach((person) => {
    if(person.checked) {
      countChecked++;
    }
  });
  if(meetingName === '') {
    errorMessage.push('Fill in the name of event field. ');
    inputName.classList.add('invalid');
  }
  if(countChecked === 0) {
    errorMessage.push('Checked person(s).');
    inputParticipants.classList.add('invalid');
  }
  return (errorMessage.length === 0)
};
// function create meeting
const createMeeting = function() {
  //get data from form fields
  let meetingName = document.querySelector('.form-group input[type=text]').value;
  let checkedPersons = document.querySelectorAll('.form-group input[type=checkbox]');
  let day = document.querySelector('#form-day').value;
  let time = document.querySelector('#form-time').value;
  // get user meetings from localStorage;
  let userMeetings = addUserMeetings();

  //check data from form fields
  if(!validationForm(meetingName, checkedPersons)) {
    showErrorMessage();
    return false;
  }
  //create event object
  let date = `${day} ${time}`;
  if(!checkTimeAndDayEvent(date)) {
    errorMessage.push('Change time or day!!!');
    showErrorMessage();
    return false;
  }
  checkedPersons.forEach((person) => {
    if(person.checked) {
      userMeetings[person.value][date] = meetingName;
      // write the object to localStorage
      setUserMeetings(userMeetings);
      //relocation to calendar page
      window.location.pathname = IndexPath;
    }
  });
};
// function create event when press button "Create"
const createEvent = function() {
  //get button Create
  const buttonCreate = document.querySelector('#button-create');

  buttonCreate.addEventListener('click', createMeeting);
};