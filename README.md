# American Lit Era Project
Web app for the American Lit Honors era project that simulates the 1970s economy (currently in progress)

# Project Requirements
The goal of this school project is to research a particular decade with a group and create an interactive, class-long presentation about different parts of the decade as well as a popular book from that decade. Our group is researching the 1970s, and we read Zen and the Art of Motorcycle Maintenance by Robert Pirsig.

# Why I'm Making This
I have been purposely avoiding web development because I always found it to be kind of annoying. Nevertheless, I understand that knowing web development is extremely important for any modern developer. I have recently been wanting to get into web development, but I don't have any time with school, especially with this massive project! So, I thought I could incorporate my learning of web development with this project in order to not only benefit myself, but to also provide a unique experience for my classmates.

# How it works (also WIP)
Each student is assigned an RFID card. Their name, along with their card ID and current balance, are stored in a RethinkDB databse. A list of "states" is stored on the database in addition to the student names. Throughout the presentation, many opportunities will be presented to the students -- for example, the opportunity to invest in a new company for, say, $50,000, will be presented. At this moment, the "state" of the program is set to pay $50,000.

There are 3 groups, each with an RFID scanner in the middle, sending inputs to input.html. When this input is received, the action is performed on the student. For example, if a student chooses to invest $50,000, they simply scan their card. In response, because the state is set to pay $50,000, the program will subtract $50,000 from their current balance in the database.

Each student accesses a website hosted on Glitch. They are initially asked to provide their name, and if a match is found in the database, the website will begin pulling the balance for that user live. When their balance is changed in the database, the balance updates live on the website.

For the user, it looks like this: get your RFID card, access the website and sign in, and scan it when you want to participate in an activity in order to see your balance update live.

I will also add a "total balance", which will update accordingly as events such as the Great Inflation of 1975 happens, so that students can see how much their balance is worth compared to when they first receieved it in 1970.

Hopefully I can get this done within the next two weeks! It is certainly a challenge for someone who knows nothing about web development, but I am optimistic nevertheless!
