const { ipcRenderer } = require('electron');

// Event handler to search for #leave-by element, not accesible through main process
ipcRenderer.on('GET_LEAVE_BY', (event) =>
{
    const leaveByElement = $('#leave-by').val();
    event.sender.send('RECEIVE_LEAVE_BY', leaveByElement);
});
