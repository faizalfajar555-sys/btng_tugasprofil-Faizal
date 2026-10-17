#include <iostream>
using namespace std;

int main ()
{
    int belanja = 0;
    float diskon;
    float bayar;

    cout << "Belanja       : "; cin >> belanja;

    if (belanja > 100000)
    {
        diskon = 0.10 * belanja;
    }
    else 
    {
        diskon = 0.05 * belanja;
    }

    bayar = belanja - diskon;
    cout << "Diskon     : " << diskon << endl;
    cout << "Total Bayar: " << bayar << endl;

    return 0;
}