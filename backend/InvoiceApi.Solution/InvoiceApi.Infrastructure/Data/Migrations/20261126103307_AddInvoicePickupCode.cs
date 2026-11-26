using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvoiceApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoicePickupCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PickupCode",
                table: "Invoices",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PickupCode",
                table: "Invoices");
        }
    }
}
