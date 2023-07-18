using Newtonsoft.Json;

namespace SoftTrello.Utils
{
    public static class Tools
    {

        public static JsonSerializerSettings settings = new JsonSerializerSettings
        {
            TypeNameHandling = TypeNameHandling.Auto,
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
        };
    }
}
