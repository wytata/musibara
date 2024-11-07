import os
import dotenv

dotenv.load_dotenv()

def create_images(opened_file):

    # Keeping this structure open to adding future images in a loop
    #images = []
    REGION = os.getenv("AWS_REGION")
    BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
    KEY = os.getenv("AWS_BUCKET_IMAGE_KEY")
    stock_image_id = 1

    image_data = f"({stock_image_id}, '{REGION}','{BUCKET_NAME}', '{KEY}')"
    #images.append(image_data)
    

    insert_images_string = f"""
INSERT INTO images (imageid, region, bucket, key) VALUES 
{image_data};
"""
    
    print(insert_images_string, file=opened_file)
    print(f'Images inserted')

    return stock_image_id


