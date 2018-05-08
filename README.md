# American Lit Era Project
Web app for the American Lit Honors era project that simulates the 1970s economy
View this project on Glitch (I wrote it almost entirely on Glitch): https://glitch.com/edit/#!/era-project

# Project Requirements
The goal of this school project is to research a particular decade with a group and create an interactive, class-long presentation about different parts of the decade as well as a popular book from that decade. Our group is researching the 1970s, and we read Zen and the Art of Motorcycle Maintenance by Robert Pirsig.

# Why I'm Making This
I have been purposely avoiding web development because I always found it to be kind of annoying. Nevertheless, I understand that knowing web development is extremely important for any modern developer. I have recently been wanting to get into web development, but I don't have any time with school, especially with this massive project! So, I thought I could incorporate my learning of web development with this project in order to not only benefit myself, but to also provide a unique experience for my classmates.

# How it works
Each student is assigned an RFID card. Their name, card ID, a randomly-generated balance, and a number of other things (you can see the specific things in the Glitch project) are stored in a RethinkDB database. A list of "states" is stored in a json file locally on the server. A master user changes the state in that json file periodically via /statechange

There are 3 groups, each with an RFID scanner in the middle, sending inputs to /input. When this input is received, the program retrieves the current state and executes a function on the user who scanned their card. For example, if a student chooses to invest $x, they simply scan their card. In response, because the state is set to subtract $x from that user in the database, the program will subtract $x from their balance in the database.

Each student accesses a website hosted on Glitch. They are initially asked to provide their name, and if a match is found in the database, the website will begin pulling the balance for that user live. When their balance is changed in the database, the balance updates live on the website.

If a student's balance is 0 or less, they die. They can also be "sent to jail" for 5 minutes (when this happens, their screen turns orange for 5 minutes and stops displaying their balance). The ultimate goal is to survive the presentation with money in your account using the given opportunities.
