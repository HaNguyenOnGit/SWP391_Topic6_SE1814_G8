using DataAccessLayer.Entities;
using MailKit.Net.Smtp;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class UserRepository
    {
        private readonly EvcoOwnershipAndCostSharingSystemContext _context;

        public UserRepository()
        {
            _context = new EvcoOwnershipAndCostSharingSystemContext();
        }

        public User GetUser(string fullName, string password)
        {
            var user = _context.Users.FirstOrDefault(x => x.FullName == fullName && x.Password == password);
            if (user == null)
            {
                return null;
            }
            return user;
        }

        public void AddUser(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
        }

        public User? GetUserByEmail(string email)
        {
            return _context.Users.FirstOrDefault(x => x.Email == email);
        }

        public User? GetUserById(int userId)
        {
            return _context.Users.FirstOrDefault(x => x.UserId == userId);
        }

        public void UpdateUser(User user)
        {
            _context.Users.Update(user);
            _context.SaveChanges();
        }
    }
}
