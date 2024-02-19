echo "Removing old pngs"
rm -rf public/sf/**/*.png
echo "Downloading and extracting wiki.tar"
wget https://kmods.space/static/wiki.tar
tar -xvf wiki.tar
rm wiki.tar
echo "Done"