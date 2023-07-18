using System.Security.Cryptography;
using System.Text;
using System.Xml.Serialization;

namespace SoftTrello.Utils
{
    public class Security
    {
        private static RSACryptoServiceProvider csp = new RSACryptoServiceProvider(2048);
        private RSAParameters _privateKey;
        private RSAParameters _publicKey;

        public Security()
        {
            _privateKey = csp.ExportParameters(true);
            _publicKey = csp.ExportParameters(false);
        }

        public string GetKey(bool isPublic)
        {
            var sw = new StringWriter();
            var xs = new XmlSerializer(typeof(RSAParameters));
            if (isPublic) xs.Serialize(sw, _publicKey); else xs.Serialize(sw, _privateKey);
            
            return sw.ToString();
        }

        public string Encrypt(string s)
        {
            csp = new RSACryptoServiceProvider();
            csp.ImportParameters(_publicKey);
            var data = Encoding.Unicode.GetBytes(s);
            var cypher = csp.Encrypt(data, false);

            return Convert.ToBase64String(cypher);
        }
        public string Decrypt(string s)
        {
            var data = Convert.FromBase64String(s);
            csp.ImportParameters(_privateKey);
            var text = csp.Decrypt(data, false);

            return Encoding.Unicode.GetString(text);
        }
    }
}
