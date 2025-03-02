#include <iostream>
using namespace::std;


int somma(int a,int b){
    int sum = a+b;
    return sum;
}


int main(){
    int a,b;
    cout<<"Inserire due numeri"<<endl;

    //lettura da tastiera dei numeri 
    cout<<"inserire il primo:";
    cin>>a;
    cout<<"inserire il secondo"; 
    cin>>b;

    //chiamata della funzione
    somma(a,b);

}