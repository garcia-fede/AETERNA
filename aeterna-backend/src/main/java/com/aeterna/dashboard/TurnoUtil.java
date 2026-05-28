package com.aeterna.dashboard;

import com.aeterna.medicacion.Turno;

import java.time.LocalTime;

public final class TurnoUtil {

    private TurnoUtil() {}

    public static Turno getTurnoActual() {
        int hora = LocalTime.now().getHour();
        if (hora >= 6 && hora <= 13) return Turno.MANIANA;
        if (hora >= 14 && hora <= 20) return Turno.TARDE;
        return Turno.NOCHE;
    }
}
