const { ipcRenderer } = require('electron');

ipcRenderer.on('GET_LEAVE_BY', (event) =>
{
    const leaveByElement = $('#leave-by').val();
    event.sender.send('RECEIVE_LEAVE_BY', leaveByElement);
});
