#!/usr/bin/env python3
"""
Generate QR codes for all restaurant tables.
Creates QR codes that link to the menu page with table number.
"""
import qrcode
import os

# Configuration
BASE_URL = "http://localhost:5173"  # Change to your production URL when deploying
OUTPUT_DIR = "qr_codes"
NUM_TABLES = 10

def generate_qr_code(table_number, url, output_path):
    """Generate a QR code for a specific table."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save image
    img.save(output_path)
    print(f"✅ Generated QR code for Table {table_number}: {output_path}")

def main():
    """Generate QR codes for all tables."""
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=" * 60)
    print("QR Code Generator for Restaurant Tables")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Number of tables: {NUM_TABLES}")
    print(f"Output directory: {OUTPUT_DIR}/")
    print()
    
    # Generate QR codes for each table
    for table_num in range(1, NUM_TABLES + 1):
        url = f"{BASE_URL}/menu?table={table_num}"
        output_path = os.path.join(OUTPUT_DIR, f"table_{table_num}_qr.png")
        generate_qr_code(table_num, url, output_path)
    
    print()
    print("=" * 60)
    print("✅ All QR codes generated successfully!")
    print("=" * 60)
    print(f"\nQR codes saved in: {os.path.abspath(OUTPUT_DIR)}/")
    print("\nNext steps:")
    print("1. Print the QR code images")
    print("2. Place them on the corresponding tables")
    print("3. Test by scanning with your phone")
    print("\n💡 Tip: For production, update BASE_URL to your domain!")

if __name__ == "__main__":
    main()
