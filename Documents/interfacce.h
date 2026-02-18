#ifndef INTERFACCE_H
#define INTERFACCE_H

#include <QDeclarativeItem>
#include <QMainWindow>
#include <QObject>
#include <QQuickItem>
#include <QSharedDataPointer>
#include <QWidget>

class interfacceData;

class interfacce
{
    Q_OBJECT
public:
    interfacce();
    interfacce(const interfacce &);
    interfacce &operator=(const interfacce &);
    ~interfacce();

private:
    QSharedDataPointer<interfacceData> data;
};

#endif // INTERFACCE_H
