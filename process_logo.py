import sys
import subprocess

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    threshold = 245
    newData = []
    for item in datas:
        # Transparent replacing near-white
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)

    # Crop out all transparent borders so the logo actually fills its container
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Resize to a reasonable dimension (max 256x256) to optimize load time
    img.thumbnail((256, 256), Image.Resampling.LANCZOS)

    # Save the processed image back
    img.save(output_path, "PNG", optimize=True)

if __name__ == "__main__":
    process_image("logo.png", "logo.png")
    print("Optimization Complete: White bg removed, padded cropped, and file compressed down.")
