using System.Security.Cryptography;
namespace OrderApi.Domain.Codes
{
    /// 8-character pickup codes such as 7K4M9QX2. The alphabet leaves out 0, O, 1, I and L so a code
    /// read aloud or typed by hand is not mixed up. 32^8 is about 1.1 trillion combinations.
    public static class PickupCode
    {
        private const string Alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        public const int Length = 8;

        public static string Generate()
        {
            Span<char> chars = stackalloc char[Length];
            for (var i = 0; i < Length; i++)
                chars[i] = Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)];
            return new string(chars);
        }

        /// Accepts what a person or scanner might give: lower case, spaces, dashes.
        public static string Normalize(string? raw) =>
            new((raw ?? string.Empty).Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray());
    }
}
