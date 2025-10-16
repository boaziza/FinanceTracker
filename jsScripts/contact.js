function storeReview() {

   const email = document.getElementById("email").value;
   const name = document.getElementById("name").value;
   const review = document.getElementById("review").value;
   
   if (!name || !review || !email) {
        alert("Fill out all the fields")
        return;
   }

   const data = {
        email : email,
        name : name,
        review : review,
   }

    const key = `review_${Date.now()}`

    

    document.getElementById("email").value = document.getElementById("email").defaultValue;
    document.getElementById("name").value = document.getElementById("name").defaultValue;
    document.getElementById("review").value = document.getElementById("review").defaultValue;

    localStorage.setItem(key, JSON.stringify(data));

   displayReview();
}

function displayReview() {
    const div = document.getElementById("reviewCards");
    let html = '';  

    const keys = Object.keys(localStorage).filter(k => k.startsWith('review_'));

    if (keys.length !== 0) {

        keys.sort((a, b) => b.localeCompare(a));
        
    
        for (const key of keys) {

            const value = localStorage.getItem(key);
            const review = JSON.parse(value);
            
            html += `
                <div class="reviewCard">
                    <h4>${review.name}</h4>
                    <p><strong>Email:</strong> ${review.email}</p>
                    <p>${review.review}</p>
                </div> 
            `; 
            

        } 
        div.innerHTML = html;
    } 
}
displayReview();