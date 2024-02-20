using Microsoft.AspNetCore.SignalR;
using QuizBuzz.Backend.Models;

namespace QuizBuzz.Backend.Hubs
{
    public class ChatHub: Hub
    {

        public async Task JoinChat(UserConnection conn)
        {
            if (conn == null) {
                Console.WriteLine("User connectio is nul!!!l");
                return;
            }

            await Clients.All.SendAsync("RecieveMessage", "admin", $"{conn.UserName} has joined");

        }
        public async Task JoinSpecificChatRoom(UserConnection conn)
        {
            if (conn == null)
            {
                Console.WriteLine("User connectio is nul!!!l");
                return;
            }
            //can change Context.ConnectionId to username or something else, this is for simplicity
            await Groups.AddToGroupAsync(Context.ConnectionId, conn.ChatRoom);
            await Clients.Group(conn.ChatRoom).SendAsync("JoinSpecificChatRoom", "admin", $"{conn.UserName} has joined {conn.ChatRoom}");
        }
    }
}
