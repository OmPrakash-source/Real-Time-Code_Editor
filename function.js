
// it write once and copy multiple place is same code 

// function some(){
//     console.log("hello om")
//     console.log("2 + 3 = ", 2+3)
// }

//     some // function by refrence not print 
//     some() // now print a value

// function additon(add1 , add2){
//     console.log(add1+add2)
//     // additon(parameter)
// }
//     additon(2,"A") // by argument
//     // additon(argument)


function additon(add1 , add2){
    return add1+add2
}
    let a = additon(2,4)

    console.log(`result : `,a)

function login(username = "jack"){
    if(!username){
        console.log(`Enter a user name`)
        return
    }
    else{
        return `${username} just login`
    }
}

console.log(login())
