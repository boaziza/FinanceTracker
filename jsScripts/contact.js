function storeReview() {

   const email = document.getElementById("email").value;
   const name = document.getElementById("name").value;
   const review = document.getElementById("review").value;
   
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
    let html;  

    if (localStorage.length !== 0) {
        
    
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key.startsWith("review_")) {

                const value = localStorage.getItem(key);
                const review = JSON.parse(value);
                
                html += `
                    <div class="reviewCard">
                        <p>${review.name}</p>
                        <p>${review.email}</p>
                        <p>${review.review}</p>
                    </div> 
                `; 
            console.log("key",review)
            }

        } 
        div.innerHTML = html;
    } 
}
displayReview();