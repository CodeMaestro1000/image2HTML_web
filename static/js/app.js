const postData = async (formData, lowerTrackbar, upperTrackbar)=> {
    try {
        const cloud_res = await fetch('https://api.cloudinary.com/v1_1/timosky/image/upload', {
            method: 'POST',
            body: formData
        });
        const data = await cloud_res.json();
        console.log("Upload Done");
        const imageData = {
            'lower': lowerTrackbar.value, 
            'upper': upperTrackbar.value, 
            'url': data.secure_url, 
            'public_id': data.public_id,
        }
        const api_res = await fetch(`${window.location.origin}/api/generate/`, { // endpoint url
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(imageData)
        })
        const newData = await api_res.blob();
        
        var reader = new FileReader();
        reader.onload = ()=> {
            let page_div = document.getElementById('page-content');
            document.body.classList.add("grey");
            page_div.innerHTML = reader.result;
            page_div.prepend(readyText);
            page_div.appendChild(downloadLink);
            page_div.appendChild(homeLink);
        }
        reader.readAsText(newData);

        const fileUrl = URL.createObjectURL(newData);
        const downloadLink = document.createElement('a');
        const homeLink = document.createElement('a');
        const readyText = document.createElement('div');
        readyText.classList.add("fs-2", "fw-light", "text-center");
        readyText.textContent = "Your HTML file is ready"

        downloadLink.href = fileUrl;
        downloadLink.download = 'test_output.html';
        downloadLink.text = "Download file";
        downloadLink.classList.add("app-btn", "mt-4", "rounded");
        
        homeLink.classList.add("app-btn", "mt-4", "rounded");
        homeLink.text = "Convert another image";
        homeLink.href = window.location.origin; // home url

        removeSpinner();
        console.log("Done");
    } catch (error) {
        console.log(error);
    }
    // close async function
}

const findOutline = (imageElement, lower, upper, canvasName)=>{
    let src = cv.imread(imageElement); // load the image from <img>
    let dst = cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC3);
    let edgeDst = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let color = [0, 255, 0, 255]; // green color
    let largestArea  = 0
    let contourId = 0;

    cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY, 0); // change to grayscale and store the result in dst array
    
    cv.Canny(dst, edgeDst, parseInt(lower), parseInt(upper), 3, false); // Edge Detection

    cv.findContours(edgeDst, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE); // finding contours
    
    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt, false);
        // the code below finds the contour with the largest area and selects that contour as the outline
        // if the contours perimeter approximation has a height of 4
        // slightly different from the python implementation because many of the js functions don't return values
        if (area > largestArea) {
            let contour_perimeter = cv.arcLength(cnt, true);
            let perimeter_approx= new cv.Mat();
            cv.approxPolyDP(cnt, perimeter_approx, 0.02 * contour_perimeter, true);
            if (perimeter_approx.size().height == 4) {
                largestArea = area;
                contourId = i;   
            }
            perimeter_approx.delete();
        }
    }
    cv.drawContours(src, contours, contourId, color, 3, cv.LINE_8, hierarchy, 100);
    cv.imshow(canvasName, src);
    src.delete(); dst.delete(); contours.delete(); hierarchy.delete(); edgeDst.delete(); // delete matrices to free up memory

}

const showSpinner = ()=>{
    document.getElementById('main').classList.add('vh-100');
    document.getElementById('page-content').classList.add("d-none");
    document.getElementById('loading-div').classList.remove('d-none');
}

const removeSpinner = ()=>{
    document.getElementById('loading-div').classList.add("d-none");
    document.getElementById('page-content').classList.remove("d-none");
    document.getElementById('main').classList.remove('vh-100');
}


(function() {
    let fileUploadEl = document.getElementById('file-upload');
    let srcImgEl = document.getElementById('src-image');
    let upperTrackbar = document.getElementById('uppertrackbar');
    let lowerTrackbar = document.getElementById('lowertrackbar');
    let inputContainer = document.getElementById('input-container');
    let imageContainer = document.getElementById('image-container');
    let lowerThreshSpan = document.getElementById("lowerThreshValue");
    let upperThreshSpan = document.getElementById("upperThreshValue");
    let uploadBtn = document.getElementById("uploadBtn");

    fileUploadEl.addEventListener("change", function (e) {
    srcImgEl.src = URL.createObjectURL(e.target.files[0]);
    }, false);

    srcImgEl.onload = function () {
        inputContainer.classList.remove("d-none");
        imageContainer.classList.remove("d-none");
        findOutline(srcImgEl, 50, 100, 'the-canvas');
    }

    upperTrackbar.addEventListener('input', function(e){
        findOutline(srcImgEl, lowerTrackbar.value, e.target.value, 'the-canvas');
        upperThreshSpan.textContent = e.target.value;
    })

    lowerTrackbar.addEventListener('input', function(e){
        findOutline(srcImgEl, e.target.value, upperTrackbar.value, 'the-canvas');
        lowerThreshSpan.textContent = e.target.value;
    })

    uploadBtn.addEventListener('click', ()=>{
        console.log("Processing...");
        let page_div = document.getElementById('page-content');
        page_div.innerHTML = "";
        showSpinner();
        const formData = new FormData();

        for ( const file of fileUploadEl.files ) {
            formData.append('file', file);
        }
        formData.append('upload_preset', 'cvuploads');
        postData(formData, lowerTrackbar, upperTrackbar);
    })

    // opencv loaded?
    window.onOpenCvReady = function () {
        removeSpinner();
    }

})()