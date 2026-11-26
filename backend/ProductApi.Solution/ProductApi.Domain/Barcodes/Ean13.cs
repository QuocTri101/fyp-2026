namespace ProductApi.Domain.Barcodes
{
    //Builds EAN-13 codes for in-store use.The prefix 200 is inside the range (200-299)
    //that GS1 reserves for internal use, so a generated code never clashes with a real product.
    public static class Ean13
    {
        private const string InStorePrefix = "200";

        /// 200 + 9-digit id + check digit. Example: id 7 gives 2000000000077.
        public static string FromId(int id)
        {
            if (id <= 0 || id > 999_999_999)
                throw new ArgumentOutOfRangeException(nameof(id), "Id must be between 1 and 999999999.");

            var body = InStorePrefix + id.ToString("D9");   // 12 digits
            return body + CheckDigit(body);
        }

        /// Weights alternate 1,3,1,3... from the left; the check digit tops the sum up to a multiple of 10.
        public static int CheckDigit(string twelveDigits)
        {
            var sum = 0;
            for (var i = 0; i < 12; i++)
            {
                var digit = twelveDigits[i] - '0';
                sum += i % 2 == 0 ? digit : digit * 3;
            }
            return (10 - sum % 10) % 10;
        }
    }
}
