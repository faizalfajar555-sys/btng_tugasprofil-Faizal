#include <iostream>
using namespace std;

int main ()
{
    int nilai = 60;
    if (nilai > 60)
    {
        cout << "Nilai      : " << nilai << endl;
        cout << "Keterangan : Lulus ";
    }
    else
    {
        cout << "Nilai      : " << nilai << endl;
        cout << "Keterangan : Gagal ";
    }
    return 0;
}