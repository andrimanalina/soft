using Microsoft.AspNetCore.SignalR;

namespace SoftTrello.Utils
{
    public class SignalRServer : Hub
    {
        #region State
        public async Task CreateState(string id, string name, int position)
        {
            await Clients.Others.SendAsync("CreateState", ObjectModel.CreateState(id, name, position));
        }
        public async Task DeleteState(string id, string name)
        {
            await Clients.Others.SendAsync("DeleteState", id, name);
        }

        public async Task UpdateState(string id, string newname, string oldname)
        {
            await Clients.Others.SendAsync("UpdateState", id, newname, oldname);
        }
        #endregion

        #region State
        public async Task CreateWorkspace(string id, string name, string color)
        {
            await Clients.Others.SendAsync("CreateWorkspace", ObjectModel.CreateWorkspace(id, name, color)) ;
        }
        #endregion
    }
}
