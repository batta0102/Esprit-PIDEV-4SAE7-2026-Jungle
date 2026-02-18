#include "interfacce.h"

class interfacceData : public QSharedData
{
public:

};

interfacce::interfacce() : data(new interfacceData)
{

}

interfacce::interfacce(const interfacce &rhs) : data(rhs.data)
{

}

interfacce &interfacce::operator=(const interfacce &rhs)
{
    if (this != &rhs)
        data.operator=(rhs.data);
    return *this;
}

interfacce::~interfacce()
{

}
