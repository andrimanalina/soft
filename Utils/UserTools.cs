using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Newtonsoft.Json;
using SoftTrello.Models;

namespace SoftTrello.Utils
{
    public static class UserTools
    {
        public enum ExistStatus
        {
            Exist, notExist, Hack
        }

        public static ExistStatus isExistUser(User user)
        {
            if (!CacheTrello.DUsers.ContainsKey(user.Mail)) return ExistStatus.notExist;

            string password = user.Password;

            if (CacheTrello.DUsers[user.Mail].Password != password) return ExistStatus.Hack;

            return ExistStatus.Exist;
        }

        public static string GetRandomPassword(string privateKey)
        {
            return "123";
        }

        public static string GetPrivateKey()
        {
            return "123";
        }
    }
}
